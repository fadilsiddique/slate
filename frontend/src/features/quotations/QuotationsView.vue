<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <!-- Title row -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2.5">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Quotations</h1>
          <p v-if="!loading && totalLoaded > 0" class="text-xs text-muted mt-0.5">
            {{ totalLoaded }} quotation{{ totalLoaded !== 1 ? 's' : '' }}
          </p>
        </div>
        <!-- Sort toggle -->
        <div class="flex items-center gap-0.5 bg-surface p-0.5 rounded-lg shrink-0">
          <button
            v-for="s in SORT_OPTIONS"
            :key="s.key"
            class="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
            :class="sortBy === s.key ? 'bg-white shadow text-gray-800' : 'text-muted'"
            @click="setSortBy(s.key)"
          >{{ s.label }}</button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="px-4 pb-2">
        <SearchBar
          v-model="search"
          placeholder="Filter by customer name…"
          @input="debouncedReload"
          @clear="clearSearch"
        />
      </div>

      <!-- Date range filter -->
      <div class="px-4 pb-2 flex items-center gap-2">
        <label class="flex-1 flex items-center gap-2 px-3 py-2 bg-surface border border-muted/25 rounded-xl">
          <span class="text-[10px] font-semibold text-muted uppercase tracking-wide shrink-0">From</span>
          <input
            type="date"
            v-model="dateFrom"
            class="flex-1 text-xs text-gray-700 bg-transparent outline-none min-w-0"
            @change="reload()"
          />
        </label>
        <span class="text-muted/40 text-xs shrink-0">—</span>
        <label class="flex-1 flex items-center gap-2 px-3 py-2 bg-surface border border-muted/25 rounded-xl">
          <span class="text-[10px] font-semibold text-muted uppercase tracking-wide shrink-0">To</span>
          <input
            type="date"
            v-model="dateTo"
            class="flex-1 text-xs text-gray-700 bg-transparent outline-none min-w-0"
            @change="reload()"
          />
        </label>
        <button
          v-if="dateFrom || dateTo"
          class="w-8 h-8 rounded-xl bg-muted/10 flex items-center justify-center shrink-0 text-muted"
          @click="clearDates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Status tabs -->
      <StatusTabStrip :tabs="STATUS_TABS" v-model="activeStatus" :active-class="activeTabClass" @update:model-value="reload()" />
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Initial skeleton -->
      <template v-if="loading && quotations.length === 0">
        <div class="space-y-2.5">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl h-[80px] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error state -->
      <ErrorState v-else-if="error" title="Couldn't load quotations" :message="error" @retry="reload(true)" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="!loading && quotations.length === 0"
        title="No quotations found"
        subtitle="Try adjusting your search or filters"
        :show-clear="!!(search || activeStatus || dateFrom || dateTo)"
        @clear="clearFilters"
      >
        <template #icon><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></template>
      </EmptyState>

      <!-- ── Quotation list ────────────────────────────────────────────── -->
      <div v-else class="space-y-2">
        <button
          v-for="q in quotations"
          :key="q.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex flex-col gap-1 text-left active:scale-[.98] transition-transform"
          @click="openQuotation(q)"
        >
          <!-- Top row: name + status badge -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-muted/80 truncate">{{ q.name }}</span>
            <StatusBadge :label="statusLabel(q)" :color-class="statusBadgeClass(q)" />
          </div>

          <!-- Customer name -->
          <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
            {{ q.customer_name || q.party_name || '—' }}
          </p>

          <!-- Date + amount -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-muted">{{ fmtDate(q.transaction_date) }}</span>
            <span class="text-sm font-bold text-gray-800">
              {{ q.currency || 'AED' }} {{ fmt(q.grand_total) }}
            </span>
          </div>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more spinner -->
      <div v-if="loading && quotations.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End of results -->
      <p v-if="!hasMore && quotations.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ quotations.length }} quotation{{ quotations.length !== 1 ? 's' : '' }} shown —
      </p>
    </div>

    <!-- ── FAB — New Quotation ─────────────────────────────────────────────── -->
    <FloatingActionButton @click="router.push({ name: 'QuotationNew' })" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotations'
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

const router         = useRouter()
const quotationStore = useQuotationStore()
const scrollEl       = inject('scrollEl')  // provided by AppShell
const { fmt, fmtDate } = useFormatters()

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS  = ['All', 'Draft', 'Open', 'Replied', 'Ordered', 'Lost', 'Cancelled']
const SORT_OPTIONS = [{ key: 'creation', label: 'Created' }, { key: 'modified', label: 'Updated' }]

// ── Display state ─────────────────────────────────────────────────────────────
const search       = ref('')
const activeStatus = ref('')
const sortBy       = ref('creation')
const dateFrom     = ref('')
const dateTo       = ref('')

const quotations  = ref([])
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
  loading.value     = true
  error.value       = null
  quotations.value  = []
  nextStart.value   = 0
  if (force) quotationStore.invalidate()

  try {
    const res = await quotationStore.fetchQuotations({
      search:   search.value,
      status:   activeStatus.value,
      sortBy:   sortBy.value,
      dateFrom: dateFrom.value,
      dateTo:   dateTo.value,
      start:    0,
    })
    quotations.value  = res.data ?? []
    hasMore.value     = res.hasMore
    nextStart.value   = quotations.value.length
    totalLoaded.value = quotations.value.length
  } catch (e) {
    console.error('[Quotations] reload failed', e)
    error.value = e?.message ?? 'Failed to load quotations'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await quotationStore.fetchQuotations({
      search:   search.value,
      status:   activeStatus.value,
      sortBy:   sortBy.value,
      dateFrom: dateFrom.value,
      dateTo:   dateTo.value,
      start:    nextStart.value,
    })
    quotations.value  = [...quotations.value, ...(res.data ?? [])]
    hasMore.value     = res.hasMore
    nextStart.value   = quotations.value.length
    totalLoaded.value = quotations.value.length
  } catch (e) {
    console.error('[Quotations] loadMore failed', e)
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

function setSortBy(key)  { sortBy.value = key; reload() }
function clearDates()   { dateFrom.value = ''; dateTo.value = ''; reload() }
function setStatus(s)   { activeStatus.value = s; reload() }
function clearSearch()  { search.value = ''; reload() }
function clearFilters() { search.value = ''; activeStatus.value = ''; dateFrom.value = ''; dateTo.value = ''; reload() }
function openQuotation(q) { router.push({ name: 'QuotationDetail', params: { name: q.name } }) }

function statusLabel(q) {
  if (q.docstatus === 2) return 'Cancelled'
  if (q.docstatus === 0) return 'Draft'
  return q.status || 'Open'
}

function statusBadgeClass(q) {
  if (q.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (q.docstatus === 0) return 'bg-gray-100 text-gray-600'
  const map = {
    Open:      'bg-primary/10 text-primary',
    Replied:   'bg-amber-50 text-amber-700',
    Ordered:   'bg-green-50 text-green-700',
    Lost:      'bg-red-50 text-red-600',
  }
  return map[q.status] ?? 'bg-gray-100 text-gray-600'
}

function activeTabClass(tab) {
  const map = {
    All:       'bg-primary text-white border-primary',
    Draft:     'bg-gray-600 text-white border-gray-600',
    Open:      'bg-primary text-white border-primary',
    Replied:   'bg-amber-500 text-white border-amber-500',
    Ordered:   'bg-green-600 text-white border-green-600',
    Lost:      'bg-red-500 text-white border-red-500',
    Cancelled: 'bg-gray-400 text-white border-gray-400',
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
