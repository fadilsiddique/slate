/**
 * quotations.js — Pinia store for the Quotations feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × status), TTL 5 min
 *   Detail      → cached per quotation name, TTL 10 min
 *   Tax templates → TTL 5 min
 *   Manual invalidation available via invalidate(name?)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/composables/useApi'

// ── Constants ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20
const LIST_TTL   = 5  * 60 * 1000  // 5 min
const DETAIL_TTL = 10 * 60 * 1000  // 10 min

/** Fields to request for the list — keep tight to reduce payload. */
export const QUOTATION_LIST_FIELDS = [
  'name', 'party_name', 'customer_name', 'transaction_date',
  'grand_total', 'status', 'docstatus', 'currency',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

// ── Store ─────────────────────────────────────────────────────────────────────
export const useQuotationStore = defineStore('quotations', () => {
  // Plain Maps — not reactive; components observe their own local refs.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // name     → { data, ts }

  // Reactive tax template options
  const taxTemplates = ref([])
  const _metaTs      = ref(0)

  // ── Tax templates ────────────────────────────────────────────────────────────
  async function fetchTaxTemplates(force = false) {
    if (!force && isFresh({ ts: _metaTs.value }, LIST_TTL)) return

    const res = await api.getList('Sales Taxes and Charges Template', {
      fields: ['name', 'title'],
      filters: [['disabled', '!=', 1]],
      limit: 50,
      orderBy: 'name asc',
    }).catch(() => null)

    if (res) {
      const rows = res?.data ?? res ?? []
      taxTemplates.value = rows.filter(Boolean)
    }
    _metaTs.value = Date.now()
  }

  // ── Quotation list ───────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of quotations.
   * Returns { data: Quotation[], hasMore: boolean }
   *
   * @param {{ search?: string, status?: string, start?: number }} opts
   */
  async function fetchQuotations({ search = '', status = '', sortBy = 'creation', dateFrom = '', dateTo = '', start = 0 } = {}) {
    const key = `${search.trim().toLowerCase()}|${status}|${sortBy}|${dateFrom}|${dateTo}`

    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = []
    if (search.trim()) filters.push(['customer_name', 'like', `%${search.trim()}%`])
    if (dateFrom)      filters.push(['transaction_date', '>=', dateFrom])
    if (dateTo)        filters.push(['transaction_date', '<=', dateTo])

    // Map status tab → docstatus/status field filters
    if (status === 'Draft')     filters.push(['docstatus', '=', 0])
    else if (status === 'Open')      { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Open']) }
    else if (status === 'Replied')   { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Replied']) }
    else if (status === 'Ordered')   { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Ordered']) }
    else if (status === 'Lost')      { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Lost']) }
    else if (status === 'Cancelled') filters.push(['docstatus', '=', 2])

    const result = await api.getList('Quotation', {
      fields: QUOTATION_LIST_FIELDS,
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

  // ── Quotation detail ─────────────────────────────────────────────────────────
  /**
   * Fetch full quotation document (Frappe includes child tables automatically).
   * Returns the document or throws if not found.
   *
   * @param {string} name  — Quotation docname
   */
  async function fetchQuotationDetail(name) {
    const hit = _detailCache.get(name)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const result = await api.getDoc('Quotation', name)
    const doc    = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    _detailCache.set(name, { data: doc, ts: Date.now() })
    return doc
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  /**
   * Create or update a Quotation document.
   * Omit doc.name to create; include it to update.
   *
   * @param {object} doc
   * @returns {Promise<object>} saved document
   */
  async function saveQuotation(doc) {
    const result = await api.saveDoc('Quotation', doc)
    const saved  = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    invalidate(doc.name ?? null)
    return saved
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  /**
   * Submit a Quotation (docstatus → 1).
   * @param {string} name
   * @param {object|null} fullDoc  — pass the full doc object so Frappe's
   *   optimistic locking check (modified timestamp) does not fail
   */
  async function submitQuotation(name, fullDoc = null) {
    // Frappe's frappe.client.submit checks the `modified` timestamp for
    // concurrency control. Passing only {doctype, name} can cause a
    // "modified after you opened it" error. Always pass the full doc.
    const payload = fullDoc ?? { doctype: 'Quotation', name }
    const submitted = await api.call('frappe.client.submit', { doc: payload })
    invalidate(name)
    return submitted
  }

  // ── Cancel ──────────────────────────────────────────────────────────────────
  /**
   * Cancel a submitted Quotation (docstatus → 2).
   * @param {string} name
   */
  async function cancelQuotation(name) {
    const cancelled = await api.call('frappe.client.cancel', { doctype: 'Quotation', name })
    invalidate(name)
    return cancelled
  }

  // ── Create Sales Order ───────────────────────────────────────────────────────
  /**
   * Call make_sales_order to get a pre-filled Sales Order document for review.
   * Returns the unmapped SO doc. Caller stores it as orderStore.setPrefill(doc)
   * and navigates to /orders/new so the user can review before saving.
   *
   * @param {string} quotationName
   */
  async function createSalesOrder(quotationName) {
    const soDoc = await api.call(
      'erpnext.selling.doctype.quotation.quotation.make_sales_order',
      { source_name: quotationName },
    )
    // Unwrap Frappe envelope if present; quotation status updates once SO is saved
    return soDoc?.data ?? soDoc
  }

  // ── Cache invalidation ──────────────────────────────────────────────────────
  /**
   * @param {string|null} name  — specific quotation, or null to clear all
   */
  function invalidate(name = null) {
    if (name) {
      _detailCache.delete(name)
      _listCache.clear()
    } else {
      _listCache.clear()
      _detailCache.clear()
      _metaTs.value = 0
    }
  }

  return {
    taxTemplates,
    fetchTaxTemplates,
    fetchQuotations,
    fetchQuotationDetail,
    saveQuotation,
    submitQuotation,
    cancelQuotation,
    createSalesOrder,
    invalidate,
  }
})
