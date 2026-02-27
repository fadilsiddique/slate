/**
 * invoices.js — Pinia store for the Sales Invoice feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × status), TTL 5 min
 *   Detail      → cached per SI name, TTL 10 min
 *   Payment modes → cached globally, TTL 5 min
 *   Manual invalidation available via invalidate(name?)
 */

import { defineStore } from 'pinia'
import { api } from '@/composables/useApi'

// ── Constants ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20
const LIST_TTL   = 5  * 60 * 1000  // 5 min
const DETAIL_TTL = 10 * 60 * 1000  // 10 min

/** Fields to request for the list — keep tight to reduce payload. */
export const SI_LIST_FIELDS = [
  'name', 'customer', 'customer_name', 'posting_date', 'due_date',
  'grand_total', 'outstanding_amount', 'status', 'docstatus', 'currency', 'is_return',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

const today = () => new Date().toISOString().slice(0, 10)

// ── Payment mode cache (module-level, not reactive) ───────────────────────────
let _modes   = []
let _modesTs = 0

// ── Store ─────────────────────────────────────────────────────────────────────
export const useInvoiceStore = defineStore('invoices', () => {
  // Plain Maps — not reactive; components observe their own local refs.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // name     → { data, ts }

  // Prefill slot for "Create from SO/DN" and Credit Note → form review flow
  let _prefillDoc = null
  function setPrefill(doc)  { _prefillDoc = doc }
  function consumePrefill() { const d = _prefillDoc; _prefillDoc = null; return d }

  // ── Invoice list ──────────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of Sales Invoices.
   * Returns { data: SalesInvoice[], hasMore: boolean }
   *
   * @param {{ search?: string, status?: string, start?: number }} opts
   */
  async function fetchInvoices({ search = '', status = '', sortBy = 'creation', dateFrom = '', dateTo = '', start = 0 } = {}) {
    const key = `${search.trim().toLowerCase()}|${status}|${sortBy}|${dateFrom}|${dateTo}`

    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = []
    if (search.trim()) filters.push(['customer_name', 'like', `%${search.trim()}%`])
    if (dateFrom)      filters.push(['posting_date', '>=', dateFrom])
    if (dateTo)        filters.push(['posting_date', '<=', dateTo])

    // Map status tab → docstatus/status field filters
    if (status === 'Draft') {
      filters.push(['docstatus', '=', 0])
    } else if (status === 'Unpaid') {
      filters.push(['docstatus', '=', 1])
      filters.push(['outstanding_amount', '>', 0])
      filters.push(['status', 'not in', ['Overdue']])
    } else if (status === 'Overdue') {
      filters.push(['docstatus', '=', 1])
      filters.push(['outstanding_amount', '>', 0])
      filters.push(['due_date', '<', today()])
    } else if (status === 'Paid') {
      filters.push(['docstatus', '=', 1])
      filters.push(['outstanding_amount', '=', 0])
      filters.push(['is_return', '=', 0])
    } else if (status === 'Return') {
      filters.push(['is_return', '=', 1])
      filters.push(['docstatus', '!=', 2])
    } else if (status === 'Cancelled') {
      filters.push(['docstatus', '=', 2])
    }

    const result = await api.getList('Sales Invoice', {
      fields: SI_LIST_FIELDS,
      filters,
      limit: PAGE_SIZE,
      start,
      orderBy: sortBy === 'modified' ? 'modified desc' : 'creation desc',
    })

    const data    = result?.data ?? result ?? []
    const hasMore = data.length === PAGE_SIZE

    if (start === 0) {
      _listCache.set(key, { data, hasMore, ts: Date.now() })
    }

    return { data, hasMore }
  }

  // ── Invoice detail ────────────────────────────────────────────────────────────
  /**
   * Fetch full Sales Invoice document (Frappe includes child tables automatically).
   * Returns the document or throws if not found.
   *
   * @param {string} name  — SI docname
   */
  async function fetchInvoice(name) {
    const hit = _detailCache.get(name)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const result = await api.getDoc('Sales Invoice', name)
    const doc    = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    _detailCache.set(name, { data: doc, ts: Date.now() })
    return doc
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  /**
   * Create or update a Sales Invoice document.
   * Omit doc.name to create; include it to update.
   *
   * @param {object} doc
   * @returns {Promise<object>} saved document
   */
  async function saveInvoice(doc) {
    const result = await api.saveDoc('Sales Invoice', doc)
    const saved  = result?.data ?? result
    invalidate(doc.name ?? null)
    return saved
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  /**
   * Submit a Sales Invoice (docstatus → 1).
   * Pass fullDoc to satisfy Frappe's optimistic locking.
   *
   * @param {string} name
   * @param {object|null} fullDoc
   */
  async function submitInvoice(name, fullDoc = null) {
    const payload   = fullDoc ?? { doctype: 'Sales Invoice', name }
    const submitted = await api.call('frappe.client.submit', { doc: payload })
    invalidate(name)
    return submitted
  }

  // ── Cancel ───────────────────────────────────────────────────────────────────
  /**
   * Cancel a Sales Invoice (docstatus → 2).
   * @param {string} name
   */
  async function cancelInvoice(name) {
    const result = await api.call('frappe.client.cancel', { doctype: 'Sales Invoice', name })
    invalidate(name)
    return result
  }

  // ── Amend ─────────────────────────────────────────────────────────────────────
  /**
   * Amend a cancelled Sales Invoice — returns a new draft with amended_from set.
   * @param {string} name
   */
  async function amendInvoice(name) {
    const amended = await api.call('frappe.client.amend_document', { doctype: 'Sales Invoice', name })
    invalidate(name)
    return amended?.data ?? amended
  }

  // ── Credit Note ───────────────────────────────────────────────────────────────
  /**
   * Create a return (credit note) document mapped from a submitted SI.
   * Returns an unsaved doc — caller sets prefill and navigates to InvoiceNew.
   * @param {string} name
   */
  async function makeReturnDoc(name) {
    const doc = await api.call(
      'erpnext.accounts.doctype.sales_invoice.sales_invoice.make_return_doc',
      { source_name: name },
    )
    return doc?.data ?? doc
  }

  // ── Payment Entry ─────────────────────────────────────────────────────────────
  /**
   * Get a pre-filled Payment Entry document for a submitted Sales Invoice.
   * Returns an unsaved PE doc — caller shows the payment sheet.
   * @param {string} invoiceName
   */
  async function makePaymentEntry(invoiceName) {
    const pe = await api.call(
      'erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry',
      { dt: 'Sales Invoice', dn: invoiceName },
    )
    return pe?.data ?? pe
  }

  /**
   * Submit a Payment Entry document (after user fills in the sheet fields).
   * @param {object} peDoc
   */
  async function submitPaymentEntry(peDoc) {
    const result = await api.call('frappe.client.submit', { doc: peDoc })
    // Invalidate the linked invoice so it reloads with updated outstanding_amount
    const linkedRef = peDoc.references?.[0]?.reference_name
    if (linkedRef) invalidate(linkedRef)
    return result
  }

  // ── Payment Modes ─────────────────────────────────────────────────────────────
  /**
   * Fetch enabled payment modes. Cached for LIST_TTL.
   * @returns {Promise<string[]>}
   */
  async function fetchPaymentModes() {
    if (_modesTs > 0 && (Date.now() - _modesTs) < LIST_TTL && _modes.length) {
      return _modes
    }
    const result = await api.getList('Mode of Payment', {
      fields: ['name'],
      filters: [['enabled', '=', 1]],
      limit: 50,
      orderBy: 'name asc',
    })
    _modes   = (result?.data ?? result ?? []).map(r => r.name)
    _modesTs = Date.now()
    return _modes
  }

  // ── Cache invalidation ────────────────────────────────────────────────────────
  /**
   * @param {string|null} name  — specific SI, or null to clear all
   */
  function invalidate(name = null) {
    if (name) {
      _detailCache.delete(name)
      _listCache.clear()
    } else {
      _listCache.clear()
      _detailCache.clear()
    }
  }

  return {
    fetchInvoices,
    fetchInvoice,
    saveInvoice,
    submitInvoice,
    cancelInvoice,
    amendInvoice,
    makeReturnDoc,
    makePaymentEntry,
    submitPaymentEntry,
    fetchPaymentModes,
    setPrefill,
    consumePrefill,
    invalidate,
  }
})
