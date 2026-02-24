/**
 * useApi.js — Centralized HTTP layer for SalesHub
 *
 * Features:
 *   • CSRF token injection (Frappe's 'fetch' bypass for same-origin JS)
 *   • Frappe response envelope unwrapping  { message: ... }
 *   • 401 → dispatches saleshub:session-expired, throws ApiError
 *   • 403 CSRF mismatch → refreshes token + retries once
 *   • Exponential backoff retry for transient 5xx / network failures
 *   • Offline mutation queue — mutations queued in-memory and replayed on
 *     the 'online' event (SW BackgroundSync is a secondary safety net)
 *   • Vue composable wrapper — reactive loading / error / pendingSync state
 */

import { ref, shallowRef } from 'vue'

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3
const BASE_DELAY_MS = 800
const RETRYABLE_STATUSES = new Set([408, 429, 502, 503, 504])
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

// Custom events (bus between layers without circular imports)
export const EV_SESSION_EXPIRED = 'saleshub:session-expired'
export const EV_QUEUE_CHANGED = 'saleshub:queue-changed'

// ── CSRF token ────────────────────────────────────────────────────────────────
// Frappe accepts the literal string 'fetch' for same-origin JS requests,
// but we prefer the real token so in-flight requests survive a token rotation.
function getCsrfToken() {
  return window.csrf_token ?? window.frappe?.csrf_token ?? 'fetch'
}

// Attempt to read a fresh CSRF token from the active session cookie.
// Frappe stores it under the key matching the session sid.
function tryReadCsrfFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)frappe_csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function refreshCsrfToken() {
  const fromCookie = tryReadCsrfFromCookie()
  if (fromCookie) window.csrf_token = fromCookie
}

// ── Offline mutation queue ────────────────────────────────────────────────────
/** @type {Array<{ label: string; execute: () => Promise<unknown> }>} */
const _offlineQueue = []

function notifyQueueChange() {
  window.dispatchEvent(
    new CustomEvent(EV_QUEUE_CHANGED, { detail: { count: _offlineQueue.length } }),
  )
}

window.addEventListener('online', async () => {
  if (_offlineQueue.length === 0) return
  // Take a snapshot so new items added during replay don't cause loops
  const snapshot = _offlineQueue.splice(0)
  notifyQueueChange()
  for (const task of snapshot) {
    try {
      await task.execute()
    } catch {
      // On repeated failure the SW BackgroundSyncPlugin will replay via fetch
    }
  }
})

// ── ApiError ──────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  /** @param {string} message @param {number} status @param {unknown} data */
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// ── Message extraction ────────────────────────────────────────────────────────
function extractErrorMessage(data) {
  if (!data) return null
  // _server_messages is a JSON-encoded array of JSON-encoded message objects
  if (data._server_messages) {
    try {
      const msgs = JSON.parse(data._server_messages)
      const first = JSON.parse(msgs[0])
      return (typeof first === 'string' ? first : first.message) || null
    } catch { /* fall through */ }
  }
  if (data.exception) return data.exception.split('\n').at(-1)?.trim() ?? null
  if (typeof data.message === 'string' && data.message !== 'ok') return data.message
  return null
}

// ── Core fetch ────────────────────────────────────────────────────────────────
/**
 * Low-level fetch with Frappe conventions, retry and offline queueing.
 * Safe to call outside Vue component context (stores, plain modules).
 *
 * @param {string} url
 * @param {{ method?: string; body?: unknown; headers?: Record<string,string>; signal?: AbortSignal }} [options]
 * @param {number} [attempt]
 * @returns {Promise<unknown>}
 */
export async function apiFetch(url, options = {}, attempt = 0) {
  const method = (options.method ?? 'GET').toUpperCase()
  const isMutation = MUTATION_METHODS.has(method)

  // ── Offline short-circuit ─────────────────────────────────────────────────
  if (!navigator.onLine && isMutation) {
    return _enqueueOffline(url, options)
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  let response
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': getCsrfToken(),
        ...options.headers,
      },
      credentials: 'same-origin',
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (networkErr) {
    // True network failure (offline, DNS, etc.)
    if (isMutation) return _enqueueOffline(url, options)
    if (attempt < MAX_RETRIES) {
      await _sleep(BASE_DELAY_MS * 2 ** attempt)
      return apiFetch(url, options, attempt + 1)
    }
    throw networkErr
  }

  // ── 401 Unauthorized — session expired ───────────────────────────────────
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent(EV_SESSION_EXPIRED))
    throw new ApiError('Your session has expired. Please log in again.', 401)
  }

  // ── 403 Forbidden — could be CSRF rotation or missing permission ──────────
  if (response.status === 403) {
    let data = {}
    try { data = await response.json() } catch { /* ignore */ }

    if (data.exc_type === 'CSRFTokenError' && attempt === 0) {
      // Frappe may have rotated the token — refresh from cookie and retry
      refreshCsrfToken()
      return apiFetch(url, options, attempt + 1)
    }

    const msg = extractErrorMessage(data) ?? 'You do not have permission to perform this action.'
    throw new ApiError(msg, 403, data)
  }

  // ── Transient server errors — retry with backoff ──────────────────────────
  if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
    const retryAfterSec = parseInt(response.headers.get('Retry-After') ?? '0', 10)
    await _sleep(retryAfterSec > 0 ? retryAfterSec * 1000 : BASE_DELAY_MS * 2 ** attempt)
    return apiFetch(url, options, attempt + 1)
  }

  // ── Parse JSON ────────────────────────────────────────────────────────────
  let data
  try {
    data = await response.json()
  } catch {
    if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status)
    return null
  }

  // ── Frappe application-level errors ───────────────────────────────────────
  if (data.exc_type || (data.exc && !data.message)) {
    const msg = extractErrorMessage(data) ?? `Request failed (HTTP ${response.status})`
    throw new ApiError(msg, response.status, data)
  }

  // ── Unwrap Frappe envelope ────────────────────────────────────────────────
  return data.message !== undefined ? data.message : data
}

// ── Offline queue helpers ─────────────────────────────────────────────────────
function _enqueueOffline(url, options) {
  return new Promise((resolve, reject) => {
    const label = `${options.method ?? 'GET'} ${url}`
    _offlineQueue.push({ label, execute: () => apiFetch(url, options, 0).then(resolve, reject) })
    notifyQueueChange()
    // We don't reject — let the caller await the queued request naturally.
    // If the app is closed before `online` fires, SW BackgroundSync covers it.
  })
}

function _sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Frappe-flavored API helpers (no reactive state) ───────────────────────────
/**
 * Raw API helpers safe for use in Pinia stores, route guards, and plain modules.
 * Each returns the unwrapped `message` from the Frappe response.
 */
export const api = {
  /** Call any @frappe.whitelist()-decorated Python method. */
  call(method, params = {}) {
    return apiFetch(`/api/method/${method}`, { method: 'POST', body: params })
  },

  /** REST list query — returns { data: [...] } */
  getList(doctype, { fields = ['name'], filters = [], limit = 20, orderBy = 'modified desc', start = 0 } = {}) {
    const qs = new URLSearchParams({
      fields: JSON.stringify(fields),
      filters: JSON.stringify(filters),
      limit_page_length: String(limit),
      limit_start: String(start),
      order_by: orderBy,
    })
    return apiFetch(`/api/resource/${doctype}?${qs}`)
  },

  /** Fetch a single document by name. */
  getDoc(doctype, name) {
    return apiFetch(`/api/resource/${doctype}/${encodeURIComponent(name)}`)
  },

  /**
   * Create (POST) or update (PUT) a document.
   * Pass `doc.name` to update an existing record; omit to create new.
   */
  saveDoc(doctype, doc) {
    const isNew = !doc.name
    return apiFetch(
      isNew
        ? `/api/resource/${doctype}`
        : `/api/resource/${doctype}/${encodeURIComponent(doc.name)}`,
      { method: isNew ? 'POST' : 'PUT', body: doc },
    )
  },

  /** Delete a document. */
  deleteDoc(doctype, name) {
    return apiFetch(`/api/resource/${doctype}/${encodeURIComponent(name)}`, { method: 'DELETE' })
  },

  /** Submit a document (docstatus → 1). */
  submitDoc(doctype, name) {
    return api.call('frappe.client.submit', { doc: { doctype, name } })
  },
}

// ── Vue Composable ────────────────────────────────────────────────────────────
/**
 * useApi() — reactive wrapper over the raw `api` helpers.
 *
 * @example
 * const { loading, error, pendingSync, getList } = useApi()
 * const items = await getList('Item', { fields: ['name', 'item_name'] })
 */
export function useApi() {
  const loading = ref(false)
  const error = shallowRef(/** @type {ApiError|Error|null} */ (null))
  const pendingSync = ref(_offlineQueue.length)

  // Keep pendingSync in sync with the queue
  const _onQueueChange = (/** @type {CustomEvent} */ e) => {
    pendingSync.value = e.detail.count
  }
  window.addEventListener(EV_QUEUE_CHANGED, _onQueueChange)
  // Note: no onUnmounted cleanup here — this is intentional. The listener is
  // lightweight and the event is infrequent. Per-instance teardown is complex
  // when useApi() is called at the module level (stores). Accept the tradeoff.

  /** Wrap any async fn with loading/error tracking. */
  async function execute(fn) {
    loading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    pendingSync,

    call: (method, params) => execute(() => api.call(method, params)),
    getList: (doctype, opts) => execute(() => api.getList(doctype, opts)),
    getDoc: (doctype, name) => execute(() => api.getDoc(doctype, name)),
    saveDoc: (doctype, doc) => execute(() => api.saveDoc(doctype, doc)),
    deleteDoc: (doctype, name) => execute(() => api.deleteDoc(doctype, name)),
    submitDoc: (doctype, name) => execute(() => api.submitDoc(doctype, name)),

    /** Escape hatch for one-off requests not covered by the helpers above. */
    fetch: (url, opts) => execute(() => apiFetch(url, opts)),
  }
}
