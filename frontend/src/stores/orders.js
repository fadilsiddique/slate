/**
 * orders.js — Pinia store for the Sales Orders feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × status), TTL 5 min
 *   Detail      → cached per SO name, TTL 10 min
 *   Manual invalidation available via invalidate(name?)
 */

import { defineStore } from 'pinia'
import { api } from '@/composables/useApi'

// ── Constants ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20
const LIST_TTL   = 5  * 60 * 1000  // 5 min
const DETAIL_TTL = 10 * 60 * 1000  // 10 min

/** Fields to request for the list — keep tight to reduce payload. */
export const SO_LIST_FIELDS = [
  'name', 'customer', 'customer_name', 'transaction_date', 'delivery_date',
  'grand_total', 'status', 'docstatus', 'currency',
  'per_delivered', 'per_billed', 'delivery_status', 'billing_status',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

// ── Store ─────────────────────────────────────────────────────────────────────
export const useOrderStore = defineStore('orders', () => {
  // Plain Maps — not reactive; components observe their own local refs.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // name     → { data, ts }

  // Prefill slot for "Create from Quotation" → form review flow
  let _prefillDoc = null
  function setPrefill(doc)  { _prefillDoc = doc }
  function consumePrefill() { const d = _prefillDoc; _prefillDoc = null; return d }

  // ── Order list ───────────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of Sales Orders.
   * Returns { data: SalesOrder[], hasMore: boolean }
   *
   * @param {{ search?: string, status?: string, start?: number }} opts
   */
  async function fetchOrders({ search = '', status = '', start = 0 } = {}) {
    const key = `${search.trim().toLowerCase()}|${status}`

    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = []
    if (search.trim()) filters.push(['customer_name', 'like', `%${search.trim()}%`])

    // Map status tab → docstatus/status field filters
    if (status === 'Draft')                 filters.push(['docstatus', '=', 0])
    else if (status === 'To Deliver and Bill') { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'To Deliver and Bill']) }
    else if (status === 'To Bill')             { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'To Bill']) }
    else if (status === 'To Deliver')          { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'To Deliver']) }
    else if (status === 'Completed')           { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Completed']) }
    else if (status === 'Cancelled')           filters.push(['docstatus', '=', 2])

    const result = await api.getList('Sales Order', {
      fields: SO_LIST_FIELDS,
      filters,
      limit: PAGE_SIZE,
      start,
      orderBy: 'creation desc',
    })

    const data    = result?.data ?? result ?? []
    const hasMore = data.length === PAGE_SIZE

    if (start === 0) {
      _listCache.set(key, { data, hasMore, ts: Date.now() })
    }

    return { data, hasMore }
  }

  // ── Order detail ─────────────────────────────────────────────────────────────
  /**
   * Fetch full Sales Order document (Frappe includes child tables automatically).
   * Returns the document or throws if not found.
   *
   * @param {string} name  — SO docname
   */
  async function fetchOrderDetail(name) {
    const hit = _detailCache.get(name)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const result = await api.getDoc('Sales Order', name)
    const doc    = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    _detailCache.set(name, { data: doc, ts: Date.now() })
    return doc
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  /**
   * Create or update a Sales Order document.
   * Omit doc.name to create; include it to update.
   *
   * @param {object} doc
   * @returns {Promise<object>} saved document
   */
  async function saveOrder(doc) {
    const result = await api.saveDoc('Sales Order', doc)
    const saved  = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    invalidate(doc.name ?? null)
    return saved
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  /**
   * Submit a Sales Order (docstatus → 1).
   * Pass fullDoc to satisfy Frappe's optimistic locking (modified timestamp check).
   *
   * @param {string} name
   * @param {object|null} fullDoc
   */
  async function submitOrder(name, fullDoc = null) {
    const payload = fullDoc ?? { doctype: 'Sales Order', name }
    const submitted = await api.call('frappe.client.submit', { doc: payload })
    invalidate(name)
    return submitted
  }

  // ── Create Delivery Note ─────────────────────────────────────────────────────
  /**
   * Map a submitted Sales Order to a pre-filled Delivery Note document for review.
   * Returns the unmapped DN doc. Caller stores it as deliveryNoteStore.setPrefill(doc)
   * and navigates to /delivery-notes/new so the user can review before saving.
   *
   * @param {string} soName
   */
  async function createDeliveryNote(soName) {
    const dnDoc = await api.call(
      'erpnext.selling.doctype.sales_order.sales_order.make_delivery_note',
      { source_name: soName },
    )
    return dnDoc?.data ?? dnDoc
  }

  // ── Create Sales Invoice ──────────────────────────────────────────────────────
  /**
   * Map a submitted Sales Order to a Sales Invoice draft and save it.
   * @param {string} soName
   */
  async function createSalesInvoice(soName) {
    const siDoc = await api.call(
      'erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice',
      { source_name: soName },
    )
    const saved = await api.saveDoc('Sales Invoice', siDoc)
    invalidate(soName)
    return saved
  }

  // ── Cache invalidation ────────────────────────────────────────────────────────
  /**
   * @param {string|null} name  — specific SO, or null to clear all
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
    fetchOrders,
    fetchOrderDetail,
    saveOrder,
    submitOrder,
    createDeliveryNote,
    createSalesInvoice,
    setPrefill,
    consumePrefill,
    invalidate,
  }
})
