/**
 * auth.js — Pinia store for SalesHub session management
 *
 * Persistence strategy:
 *   On load  → hydrate user/userInfo from localStorage (instant UI render)
 *   On mount → verify hydrated state against the server in the background
 *   On change → auto-persist to localStorage via watcher
 *   On logout / session expiry → wipe localStorage
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { api } from '@/composables/useApi'

const STORAGE_KEY = 'saleshub:auth'
const EXPIRY_KEY = 'saleshub:auth:expires'
// Sessions are cached for 8 hours; after that we force a server verification
const CACHE_TTL_MS = 8 * 60 * 60 * 1000

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadStored() {
  try {
    const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) ?? '0', 10)
    if (Date.now() > expiry) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return null
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

function persist(user, userInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, userInfo }))
    localStorage.setItem(EXPIRY_KEY, String(Date.now() + CACHE_TTL_MS))
  } catch { /* storage quota exceeded — ignore */ }
}

function wipe() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  const stored = loadStored()

  const user = ref(stored?.user ?? null)
  const userInfo = ref(stored?.userInfo ?? null)
  const loading = ref(false)
  /** True while the background server-verification is in flight. */
  const verifying = ref(false)

  const isLoggedIn = computed(() => !!user.value && user.value !== 'Guest')

  // Auto-persist whenever user or userInfo changes
  watch(
    [user, userInfo],
    ([u, info]) => {
      if (u && u !== 'Guest') {
        persist(u, info)
      } else {
        wipe()
      }
    },
    { deep: true },
  )

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Verify the session with the server.
   * Uses the cached value immediately while the request is in flight so the
   * UI can render instantly. If the server says Guest, we clear the cache.
   */
  async function fetchUser() {
    verifying.value = true
    try {
      const loggedUser = await api.call('frappe.auth.get_logged_user')

      if (!loggedUser || loggedUser === 'Guest') {
        clearSession()
        return
      }

      user.value = loggedUser

      // Refresh userInfo in the background — non-critical
      try {
        const info = await api.call('frappe.client.get_value', {
          doctype: 'User',
          filters: { name: loggedUser },
          fieldname: ['full_name', 'email', 'user_image', 'role_profile_name'],
        })
        userInfo.value = info
      } catch { /* use cached userInfo */ }
    } catch (err) {
      // Network failure — keep cached state; don't clear on transient errors.
      // A 401 from apiFetch will have already dispatched EV_SESSION_EXPIRED.
      if (err?.status === 401) clearSession()
    } finally {
      verifying.value = false
    }
  }

  /**
   * Login via Frappe's session API.
   * Frappe sets the `sid` cookie on success; we then verify to get userInfo.
   */
  async function login(usr, pwd) {
    loading.value = true
    try {
      await api.call('login', { usr, pwd })
      // After login Frappe issues a new CSRF token tied to the new session.
      // Read it from the cookie if available.
      _refreshCsrfFromCookie()
      await fetchUser()
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout — invalidates the server session, then wipes local state.
   * Wrapped in try/catch so a network failure doesn't block the local clear.
   */
  async function logout() {
    try {
      await api.call('logout')
    } catch { /* ignore — server might already have expired the session */ }
    clearSession()
  }

  /**
   * Clear local session state without making a server call.
   * Called by the router's session-expired listener.
   */
  function clearSession() {
    user.value = null
    userInfo.value = null
    wipe()
  }

  return {
    user,
    userInfo,
    loading,
    verifying,
    isLoggedIn,
    fetchUser,
    login,
    logout,
    clearSession,
  }
})

// ── CSRF refresh helper (module-private) ──────────────────────────────────────
function _refreshCsrfFromCookie() {
  const match = document.cookie.match(/(?:^|;\s*)frappe_csrf_token=([^;]+)/)
  if (match) window.csrf_token = decodeURIComponent(match[1])
}
