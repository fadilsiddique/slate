/**
 * deliveryNotes.js — Pinia store for the Delivery Notes feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × status), TTL 5 min
 *   Detail      → cached per DN name, TTL 10 min
 *   Warehouses  → cached globally, TTL 5 min
 *   Manual invalidation available via invalidate(name?)
 */

import { defineStore } from 'pinia'
import { api } from '@/composables/useApi'

// ── Constants ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20
const LIST_TTL   = 5  * 60 * 1000  // 5 min
const DETAIL_TTL = 10 * 60 * 1000  // 10 min

/** Fields to request for the list — keep tight to reduce payload. */
export const DN_LIST_FIELDS = [
  'name', 'customer', 'customer_name', 'posting_date',
  'grand_total', 'status', 'docstatus', 'currency', 'per_billed',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

// ── Warehouse cache (module-level, not reactive) ───────────────────────────────
let _warehouses  = []
let _warehouseTs = 0

// ── Store ─────────────────────────────────────────────────────────────────────
export const useDeliveryNoteStore = defineStore('deliveryNotes', () => {
  // Plain Maps — not reactive; components observe their own local refs.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // name     → { data, ts }

  // Prefill slot for "Create from Sales Order" → form review flow
  let _prefillDoc = null
  function setPrefill(doc)  { _prefillDoc = doc }
  function consumePrefill() { const d = _prefillDoc; _prefillDoc = null; return d }

  // ── DN list ──────────────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of Delivery Notes.
   * Returns { data: DeliveryNote[], hasMore: boolean }
   *
   * @param {{ search?: string, status?: string, start?: number }} opts
   */
  async function fetchDeliveryNotes({ search = '', status = '', start = 0 } = {}) {
    const key = `${search.trim().toLowerCase()}|${status}`

    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = []
    if (search.trim()) filters.push(['customer_name', 'like', `%${search.trim()}%`])

    // Map status tab → docstatus/status field filters
    if (status === 'Draft')         filters.push(['docstatus', '=', 0])
    else if (status === 'To Bill')  { filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'To Bill']) }
    else if (status === 'Completed'){ filters.push(['docstatus', '=', 1]); filters.push(['status', '=', 'Completed']) }
    else if (status === 'Cancelled') filters.push(['docstatus', '=', 2])

    const result = await api.getList('Delivery Note', {
      fields: DN_LIST_FIELDS,
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

  // ── DN detail ────────────────────────────────────────────────────────────────
  /**
   * Fetch full Delivery Note document (Frappe includes child tables automatically).
   * Returns the document or throws if not found.
   *
   * @param {string} name  — DN docname
   */
  async function fetchDeliveryNoteDetail(name) {
    const hit = _detailCache.get(name)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const result = await api.getDoc('Delivery Note', name)
    const doc    = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    _detailCache.set(name, { data: doc, ts: Date.now() })
    return doc
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  /**
   * Create or update a Delivery Note document.
   * Omit doc.name to create; include it to update.
   *
   * @param {object} doc
   * @returns {Promise<object>} saved document
   */
  async function saveDeliveryNote(doc) {
    const result = await api.saveDoc('Delivery Note', doc)
    const saved  = result?.data ?? result   // unwrap Frappe's { data: {...} } envelope
    invalidate(doc.name ?? null)
    return saved
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  /**
   * Submit a Delivery Note (docstatus → 1).
   * Pass fullDoc to satisfy Frappe's optimistic locking (modified timestamp check).
   *
   * @param {string} name
   * @param {object|null} fullDoc
   */
  async function submitDeliveryNote(name, fullDoc = null) {
    const payload   = fullDoc ?? { doctype: 'Delivery Note', name }
    const submitted = await api.call('frappe.client.submit', { doc: payload })
    invalidate(name)
    return submitted
  }

  // ── Create Sales Invoice ──────────────────────────────────────────────────────
  /**
   * Map a submitted Delivery Note to a Sales Invoice draft and save it.
   * @param {string} dnName
   */
  async function createSalesInvoice(dnName) {
    const siDoc = await api.call(
      'erpnext.stock.doctype.delivery_note.delivery_note.make_sales_invoice',
      { source_name: dnName },
    )
    const result = await api.saveDoc('Sales Invoice', siDoc)
    const saved  = result?.data ?? result
    invalidate(dnName)
    return saved
  }

  // ── Warehouse list ────────────────────────────────────────────────────────────
  /**
   * Fetch non-group, enabled warehouses for a company. Cached for LIST_TTL.
   * @param {string} company
   * @returns {Promise<Array<{name:string, warehouse_name:string}>>}
   */
  async function fetchWarehouses(company) {
    if (_warehouseTs > 0 && (Date.now() - _warehouseTs) < LIST_TTL && _warehouses.length) {
      return _warehouses
    }
    const result = await api.getList('Warehouse', {
      fields: ['name', 'warehouse_name'],
      filters: [
        ['company',    '=', company],
        ['is_group',   '=', 0],
        ['disabled',   '!=', 1],
      ],
      limit: 100,
      orderBy: 'warehouse_name asc',
    })
    _warehouses  = result?.data ?? result ?? []
    _warehouseTs = Date.now()
    return _warehouses
  }

  // ── Stock availability (best-effort) ─────────────────────────────────────────
  /**
   * Returns actual_qty for an item in a warehouse, or null on failure.
   * @param {string} itemCode
   * @param {string} warehouse
   * @returns {Promise<number|null>}
   */
  async function fetchStock(itemCode, warehouse) {
    try {
      const result = await api.getList('Bin', {
        fields: ['actual_qty'],
        filters: [
          ['item_code', '=', itemCode],
          ['warehouse', '=', warehouse],
        ],
        limit: 1,
      })
      const rows = result?.data ?? result ?? []
      return rows[0]?.actual_qty ?? 0
    } catch {
      return null
    }
  }

  // ── Cache invalidation ────────────────────────────────────────────────────────
  /**
   * @param {string|null} name  — specific DN, or null to clear all
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
    fetchDeliveryNotes,
    fetchDeliveryNoteDetail,
    saveDeliveryNote,
    submitDeliveryNote,
    createSalesInvoice,
    fetchWarehouses,
    fetchStock,
    setPrefill,
    consumePrefill,
    invalidate,
  }
})
