<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <div
      class="flex items-center justify-center overflow-hidden bg-surface transition-all duration-200"
      :style="{ height: refreshing ? '52px' : `${pullRatio * 52}px`, opacity: Math.max(pullRatio, refreshing ? 1 : 0) }"
    >
      <svg
        class="w-5 h-5 text-primary"
        :class="refreshing ? 'animate-spin' : ''"
        :style="{ transform: refreshing ? '' : `rotate(${pullRatio * 360}deg)` }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    </div>

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <!-- Title row -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2.5">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Sales Orders</h1>
          <p v-if="!loading && totalLoaded > 0" class="text-xs text-muted mt-0.5">
            {{ totalLoaded }} order{{ totalLoaded !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Search bar -->
      <div class="px-4 pb-2">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Search by customer name…"
            autocomplete="off"
            class="w-full pl-9 pr-9 py-2.5 text-sm bg-surface rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary transition"
            @input="debouncedReload"
          />
          <button
            v-if="search"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-600 p-0.5"
            @click="clearSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Status tabs -->
      <div class="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in STATUS_TABS"
          :key="tab"
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
          :class="activeStatus === (tab === 'All' ? '' : tab)
            ? activeTabClass(tab)
            : 'bg-white text-gray-600 border-muted/40'"
          @click="setStatus(tab === 'All' ? '' : tab)"
        >{{ tab }}</button>
      </div>
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Initial skeleton -->
      <template v-if="loading && orders.length === 0">
        <div class="space-y-2.5">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl h-[84px] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="text-gray-700 font-semibold">Couldn't load orders</p>
        <p class="text-red-400 text-xs mt-1 px-6 break-all">{{ error }}</p>
        <button
          class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
          @click="reload(true)"
        >Try again</button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && orders.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
        </div>
        <p class="text-gray-700 font-semibold">No orders found</p>
        <p class="text-muted text-sm mt-1">Try adjusting your search or status filter</p>
        <button
          v-if="search || activeStatus"
          class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
          @click="clearFilters"
        >Clear filters</button>
      </div>

      <!-- ── Order list ─────────────────────────────────────────────────── -->
      <div v-else class="space-y-2">
        <button
          v-for="o in orders"
          :key="o.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex flex-col gap-1 text-left active:scale-[.98] transition-transform"
          @click="router.push({ name: 'OrderDetail', params: { name: o.name } })"
        >
          <!-- Top row: name + status badge -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-muted/80 truncate">{{ o.name }}</span>
            <span
              class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="statusBadgeClass(o)"
            >{{ statusLabel(o) }}</span>
          </div>

          <!-- Customer name -->
          <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
            {{ o.customer_name || o.customer || '—' }}
          </p>

          <!-- Date + delivery % + amount -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-muted">
              {{ fmtDate(o.transaction_date) }}
              <span v-if="o.per_delivered > 0" class="ml-1 text-primary/70">
                · Delivered {{ o.per_delivered }}%
              </span>
            </span>
            <span class="text-sm font-bold text-gray-800">
              {{ o.currency || 'AED' }} {{ fmt(o.grand_total) }}
            </span>
          </div>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more spinner -->
      <div v-if="loading && orders.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End of results -->
      <p v-if="!hasMore && orders.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }} shown —
      </p>
    </div>

    <!-- ── FAB — New Sales Order ───────────────────────────────────────────── -->
    <button
      class="fixed bottom-20 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-20"
      @click="router.push({ name: 'OrderNew' })"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useFormatters } from '@/composables/useFormatters'

const router     = useRouter()
const orderStore = useOrderStore()
const scrollEl   = inject('scrollEl')  // provided by AppShell
const { fmt, fmtDate } = useFormatters()

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = ['All', 'Draft', 'To Deliver and Bill', 'To Bill', 'To Deliver', 'Completed', 'Cancelled']

// ── Display state ─────────────────────────────────────────────────────────────
const search       = ref('')
const activeStatus = ref('')

const orders      = ref([])
const loading     = ref(false)
const error       = ref(null)
const hasMore     = ref(false)
const nextStart   = ref(0)
const totalLoaded = ref(0)

// ── Pull-to-refresh ───────────────────────────────────────────────────────────
const { pullRatio, refreshing } = usePullToRefresh(scrollEl, () => reload(true))

// ── Infinite scroll ───────────────────────────────────────────────────────────
const sentinel = ref(null)
let observer   = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting && hasMore.value && !loading.value) loadMore() },
    { rootMargin: '150px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})
onUnmounted(() => observer?.disconnect())

// ── Data loading ──────────────────────────────────────────────────────────────
async function reload(force = false) {
  loading.value   = true
  error.value     = null
  orders.value    = []
  nextStart.value = 0
  if (force) orderStore.invalidate()

  try {
    const res = await orderStore.fetchOrders({
      search: search.value,
      status: activeStatus.value,
      start:  0,
    })
    orders.value      = res.data ?? []
    hasMore.value     = res.hasMore
    nextStart.value   = orders.value.length
    totalLoaded.value = orders.value.length
  } catch (e) {
    console.error('[Orders] reload failed', e)
    error.value = e?.message ?? 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await orderStore.fetchOrders({
      search: search.value,
      status: activeStatus.value,
      start:  nextStart.value,
    })
    orders.value      = [...orders.value, ...(res.data ?? [])]
    hasMore.value     = res.hasMore
    nextStart.value   = orders.value.length
    totalLoaded.value = orders.value.length
  } catch (e) {
    console.error('[Orders] loadMore failed', e)
  } finally {
    loading.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
let searchTimer = null
function debouncedReload() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => reload(), 320)
}

function setStatus(s)   { activeStatus.value = s; reload() }
function clearSearch()  { search.value = ''; reload() }
function clearFilters() { search.value = ''; activeStatus.value = ''; reload() }

function statusLabel(o) {
  if (o.docstatus === 2) return 'Cancelled'
  if (o.docstatus === 0) return 'Draft'
  return o.status || 'To Deliver and Bill'
}

function statusBadgeClass(o) {
  if (o.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (o.docstatus === 0) return 'bg-gray-100 text-gray-600'
  const map = {
    'To Deliver and Bill': 'bg-primary/10 text-primary',
    'To Bill':             'bg-amber-50 text-amber-700',
    'To Deliver':          'bg-blue-50 text-blue-700',
    Completed:             'bg-green-50 text-green-700',
  }
  return map[o.status] ?? 'bg-gray-100 text-gray-600'
}

function activeTabClass(tab) {
  const map = {
    All:                   'bg-primary text-white border-primary',
    Draft:                 'bg-gray-600 text-white border-gray-600',
    'To Deliver and Bill': 'bg-primary text-white border-primary',
    'To Bill':             'bg-amber-500 text-white border-amber-500',
    'To Deliver':          'bg-blue-500 text-white border-blue-500',
    Completed:             'bg-green-600 text-white border-green-600',
    Cancelled:             'bg-gray-400 text-white border-gray-400',
  }
  return map[tab] ?? 'bg-primary text-white border-primary'
}


// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await reload()
})
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
