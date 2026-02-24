/**
 * items.js — Pinia store for the Items feature
 *
 * Caching strategy:
 *   List pages  → cached per (search × group × brand), TTL 5 min
 *   Item detail → cached per item_code, TTL 10 min
 *   Filter meta → Item Groups + Brands, TTL 5 min
 *   Manual invalidation available via invalidate(itemCode?)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/composables/useApi'

// ── Constants ─────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 20
const LIST_TTL  = 5  * 60 * 1000  // 5 min
const DETAIL_TTL = 10 * 60 * 1000  // 10 min

/** Fields to request for the list — keep tight to reduce payload. */
export const ITEM_LIST_FIELDS = [
  'name', 'item_code', 'item_name', 'item_group', 'brand',
  'image', 'standard_rate', 'stock_uom', 'has_variants',
  'variant_of', 'is_stock_item', 'disabled',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const makeCacheKey = (search, group, brand) =>
  `${search.trim().toLowerCase()}|${group}|${brand}`

const isFresh = (entry, ttl) =>
  !!entry && (Date.now() - entry.ts) < ttl

// ── Store ─────────────────────────────────────────────────────────────────────
export const useItemStore = defineStore('items', () => {
  // Plain Maps — not reactive because components observe their own refs.
  // The store is a data-access layer, not a reactive view-model.
  const _listCache   = new Map()  // cacheKey → { data, hasMore, ts }
  const _detailCache = new Map()  // itemCode → { data, ts }

  // Reactive filter options (used by views to render chips)
  const itemGroups = ref([])
  const brands     = ref([])
  const _metaTs    = ref(0)

  // ── Filter options ──────────────────────────────────────────────────────────
  async function fetchFilterOptions(force = false) {
    if (!force && isFresh({ ts: _metaTs.value }, LIST_TTL)) return

    const [groupsRes, brandsRes] = await Promise.allSettled([
      api.getList('Item Group', {
        fields: ['name'],
        filters: [['is_group', '=', 0], ['disabled', '!=', 1]],
        limit: 200,
        orderBy: 'name asc',
      }),
      api.getList('Brand', {
        fields: ['name'],
        limit: 200,
        orderBy: 'name asc',
      }),
    ])

    if (groupsRes.status === 'fulfilled') {
      const rows = groupsRes.value?.data ?? groupsRes.value ?? []
      itemGroups.value = rows.map((r) => r.name).filter(Boolean)
    }
    if (brandsRes.status === 'fulfilled') {
      const rows = brandsRes.value?.data ?? brandsRes.value ?? []
      brands.value = rows.map((r) => r.name).filter(Boolean)
    }
    _metaTs.value = Date.now()
  }

  // ── Item list ───────────────────────────────────────────────────────────────
  /**
   * Fetch (or serve from cache) a page of items.
   * Returns { data: Item[], hasMore: boolean }
   */
  async function fetchItems({ search = '', group = '', brand = '', start = 0 } = {}) {
    const key = makeCacheKey(search, group, brand)

    // Serve first page from cache if still fresh
    if (start === 0) {
      const hit = _listCache.get(key)
      if (isFresh(hit, LIST_TTL)) return hit
    }

    const filters = [['disabled', '!=', 1]]
    if (search.trim()) filters.push(['item_name', 'like', `%${search.trim()}%`])
    if (group)         filters.push(['item_group', '=', group])
    if (brand)         filters.push(['brand', '=', brand])

    const result = await api.getList('Item', {
      fields: ITEM_LIST_FIELDS,
      filters,
      limit: PAGE_SIZE,
      start,
      orderBy: 'item_name asc',
    })

    const data    = result?.data ?? result ?? []
    const hasMore = data.length === PAGE_SIZE

    if (start === 0) {
      _listCache.set(key, { data, hasMore, ts: Date.now() })
    }

    return { data, hasMore }
  }

  // ── Item detail ─────────────────────────────────────────────────────────────
  /**
   * Fetch full item detail with prices, stock bins, and variants in parallel.
   * Returns the merged detail object or throws if the item is not found.
   */
  async function fetchItemDetail(itemCode) {
    const hit = _detailCache.get(itemCode)
    if (isFresh(hit, DETAIL_TTL)) return hit.data

    const [rawDocRes, pricesRes, binsRes, variantsRes] = await Promise.allSettled([
      // Full document (includes child tables like attributes, taxes, etc.)
      api.getDoc('Item', itemCode),

      // Selling price lists
      api.getList('Item Price', {
        fields: ['price_list', 'price_list_rate', 'currency', 'uom'],
        filters: [['item_code', '=', itemCode], ['selling', '=', 1]],
        limit: 50,
        orderBy: 'price_list asc',
      }),

      // Warehouse stock levels (Bin doctype — one row per warehouse)
      api.getList('Bin', {
        fields: ['warehouse', 'actual_qty', 'projected_qty', 'reserved_qty'],
        filters: [['item_code', '=', itemCode]],
        limit: 50,
        orderBy: 'actual_qty desc',
      }),

      // Variants (if this is a template item)
      api.getList('Item', {
        fields: [...ITEM_LIST_FIELDS, 'attributes'],
        filters: [['variant_of', '=', itemCode], ['disabled', '!=', 1]],
        limit: 100,
        orderBy: 'item_name asc',
      }),
    ])

    if (rawDocRes.status === 'rejected') {
      throw rawDocRes.reason ?? new Error(`Item ${itemCode} not found`)
    }

    // Unwrap Frappe's { data: {...} } REST envelope
    const raw = rawDocRes.value
    const doc = raw?.data ?? raw

    const detail = {
      ...doc,
      prices: pricesRes.status   === 'fulfilled' ? (pricesRes.value?.data   ?? pricesRes.value   ?? []) : [],
      bins:   binsRes.status     === 'fulfilled' ? (binsRes.value?.data     ?? binsRes.value     ?? []) : [],
      variants: variantsRes.status === 'fulfilled' ? (variantsRes.value?.data ?? variantsRes.value ?? []) : [],
    }

    _detailCache.set(itemCode, { data: detail, ts: Date.now() })
    return detail
  }

  // ── Stock summary ───────────────────────────────────────────────────────────
  /** Compute a { total, inStock, warehouses } summary from bins. */
  function stockSummary(bins = []) {
    const warehouses = bins.filter((b) => b.actual_qty !== 0)
    const total = warehouses.reduce((s, b) => s + (b.actual_qty ?? 0), 0)
    return { total, inStock: total > 0, warehouses }
  }

  // ── Cache invalidation ──────────────────────────────────────────────────────
  /** Invalidate a specific item's cache, or everything if no itemCode given. */
  function invalidate(itemCode = null) {
    if (itemCode) {
      _detailCache.delete(itemCode)
      // Also bust any list page that might contain this item
      for (const key of _listCache.keys()) {
        _listCache.delete(key)
      }
    } else {
      _listCache.clear()
      _detailCache.clear()
      _metaTs.value = 0
    }
  }

  return {
    itemGroups,
    brands,
    fetchFilterOptions,
    fetchItems,
    fetchItemDetail,
    stockSummary,
    invalidate,
  }
})
