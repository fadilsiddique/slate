<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

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
        <SearchBar
          v-model="search"
          placeholder="Search by customer name…"
          @input="debouncedReload"
          @clear="clearSearch"
        />
      </div>

      <!-- Status tabs -->
      <StatusTabStrip :tabs="STATUS_TABS" v-model="activeStatus" :active-class="activeTabClass" @update:model-value="reload()" />
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
      <ErrorState v-else-if="error" title="Couldn't load orders" :message="error" @retry="reload(true)" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="!loading && orders.length === 0"
        title="No orders found"
        subtitle="Try adjusting your search or status filter"
        :show-clear="!!(search || activeStatus)"
        @clear="clearFilters"
      >
        <template #icon><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></template>
      </EmptyState>

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
            <StatusBadge :label="statusLabel(o)" :color-class="statusBadgeClass(o)" />
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
    <FloatingActionButton @click="router.push({ name: 'OrderNew' })" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useFormatters } from '@/composables/useFormatters'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import SearchBar from '@/components/shared/SearchBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator.vue'
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue'
import StatusTabStrip from '@/components/shared/StatusTabStrip.vue'

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
const { sentinel } = useInfiniteScroll(
  () => hasMore.value && !loading.value,
  loadMore,
)

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
