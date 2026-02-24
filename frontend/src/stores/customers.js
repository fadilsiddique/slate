/**
 * customers.js — Pinia store for the Customers feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × group × territory), TTL 5 min
 *   Customer detail → cached per customer name, TTL 10 min
 *   Filter meta → Customer Groups + Territories, TTL 5 min
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
export const CUSTOMER_LIST_FIELDS = [
  'name', 'customer_name', 'customer_type', 'customer_group',
  'territory', 'mobile_no', 'email_id', 'disabled',
]

/** Fields for the Quotation mini-list on the detail card. */
const QUOTATION_FIELDS = [
  'name', 'transaction_date', 'grand_total', 'status', 'docstatus',
]

/** Fields for the Sales Order mini-list on the detail card. */
const SO_FIELDS = [
  'name', 'transaction_date', 'grand_total', 'status', 'docstatus',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeCacheKey = (search, group, territory) =>
  `${search.trim().toLowerCase()}|${group}|${territory}`

const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

// ── Store ─────────────────────────────────────────────────────────────────────
export const useCustomerStore = defineStore('customers', () => {
  // Plain Maps — not reactive; components observe their own local refs.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // name     → { data, ts }

  // Reactive filter options (used by views to render chips)
  const customerGroups = ref([])
  const territories    = ref([])
  const _metaTs        = ref(0)

  // ── Filter options ──────────────────────────────────────────────────────────
  async function fetchFilterOptions(force = false) {
    if (!force && isFresh({ ts: _metaTs.value }, LIST_TTL)) return

    const [groupsRes, terrRes] = await Promise.allSettled([
      api.getList('Customer Group', {
        fields: ['name'],
        filters: [['is_group', '=', 0]],
        limit: 200,
        orderBy: 'name asc',
      }),
      api.getList('Territory', {
        fields: ['name'],
        filters: [['is_group', '=', 0]],
        limit: 200,
        orderBy: 'name asc',
      }),
    ])

    if (groupsRes.status === 'fulfilled') {
      const rows = groupsRes.value?.data ?? groupsRes.value ?? []
      customerGroups.value = rows.map((r) => r.name).filter(Boolean)
    }
    if (terrRes.status === 'fulfilled') {
      const rows = terrRes.value?.data ?? terrRes.value ?? []
      territories.value = rows.map((r) => r.name).filter(Boolean)
    }
    _metaTs.value = Date.now()
  }

  // ── Customer list ───────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of customers.
   * Returns { data: Customer[], hasMore: boolean }
   *
   * @param {{ search?: string, group?: string, territory?: string, start?: number }} opts
   */
  async function fetchCustomers({ search = '', group = '', territory = '', start = 0 } = {}) {
    const key = makeCacheKey(search, group, territory)

    // Serve first page from cache if still fresh
    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = [['disabled', '!=', 1]]
    if (search.trim()) filters.push(['customer_name', 'like', `%${search.trim()}%`])
    if (group)         filters.push(['customer_group', '=', group])
    if (territory)     filters.push(['territory', '=', territory])

    const result = await api.getList('Customer', {
      fields: CUSTOMER_LIST_FIELDS,
      filters,
      limit: PAGE_SIZE,
      start,
      orderBy: 'customer_name asc',
    })

    const data    = result?.data ?? result ?? []
    const hasMore = data.length === PAGE_SIZE

    if (start === 0) {
      _listCache.set(key, { data, hasMore, ts: Date.now() })
    }

    return { data, hasMore }
  }

  // ── Customer detail ─────────────────────────────────────────────────────────
  /**
   * Fetch full customer detail with contacts, addresses, financials, and
   * recent transactions in parallel. Returns merged detail object or throws.
   *
   * @param {string} name  — Customer docname
   */
  async function fetchCustomerDetail(name) {
    const hit = _detailCache.get(name)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const [rawDocRes, dashRes, quotRes, soRes] = await Promise.allSettled([
      // Full doc — includes __onload.addr_list and __onload.contact_list
      api.getDoc('Customer', name),

      // Dashboard financials (outstanding, billed this year)
      api.call(
        'erpnext.selling.doctype.customer.customer.get_dashboard_info',
        { name },
      ),

      // Recent quotations (last 10, excluding cancelled)
      api.getList('Quotation', {
        fields: QUOTATION_FIELDS,
        filters: [
          ['party_name', '=', name],
          ['docstatus', '!=', 2],
        ],
        limit: 10,
        orderBy: 'creation desc',
      }),

      // Recent sales orders (last 10, excluding cancelled)
      api.getList('Sales Order', {
        fields: SO_FIELDS,
        filters: [
          ['customer', '=', name],
          ['docstatus', '!=', 2],
        ],
        limit: 10,
        orderBy: 'creation desc',
      }),
    ])

    // Primary doc must succeed — everything else degrades gracefully
    if (rawDocRes.status === 'rejected') {
      throw rawDocRes.reason ?? new Error(`Customer "${name}" not found`)
    }

    // Unwrap Frappe's { data: {...} } REST envelope
    const raw = rawDocRes.value
    const doc = raw?.data ?? raw

    // Dashboard info returns an array; take index 0 — null if API failed
    const dashboardInfo = dashRes.status === 'fulfilled'
      ? ((dashRes.value ?? [])[0] ?? null)
      : null

    const quotations  = quotRes.status === 'fulfilled'
      ? (quotRes.value?.data ?? quotRes.value ?? [])
      : []

    const salesOrders = soRes.status === 'fulfilled'
      ? (soRes.value?.data ?? soRes.value ?? [])
      : []

    const detail = {
      ...doc,
      // Flatten __onload to top-level for clean view access
      addrList:    doc.__onload?.addr_list    ?? [],
      contactList: doc.__onload?.contact_list ?? [],
      dashboardInfo,
      quotations,
      salesOrders,
    }

    _detailCache.set(name, { data: detail, ts: Date.now() })
    return detail
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  /**
   * Create or update a Customer document.
   * Omit doc.name to create; include it to update.
   *
   * @param {object} doc
   * @returns {Promise<object>} saved document
   */
  async function saveCustomer(doc) {
    const saved = await api.saveDoc('Customer', doc)
    invalidate(doc.name ?? null)
    return saved
  }

  // ── Cache invalidation ──────────────────────────────────────────────────────
  /**
   * @param {string|null} name  — specific customer, or null to clear all
   */
  function invalidate(name = null) {
    if (name) {
      _detailCache.delete(name)
      // Bust all list pages — any could contain this customer
      _listCache.clear()
    } else {
      _listCache.clear()
      _detailCache.clear()
      _metaTs.value = 0
    }
  }

  return {
    customerGroups,
    territories,
    fetchFilterOptions,
    fetchCustomers,
    fetchCustomerDetail,
    saveCustomer,
    invalidate,
  }
})
