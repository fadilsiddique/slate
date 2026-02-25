<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <!-- Title row -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2.5">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Invoices</h1>
          <p v-if="!loading && totalLoaded > 0" class="text-xs text-muted mt-0.5">
            {{ totalLoaded }} invoice{{ totalLoaded !== 1 ? 's' : '' }}
          </p>
        </div>
        <SortToggle v-model="sortBy" @update:model-value="reload()" />
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

      <!-- Filter row: Status + Date -->
      <div class="px-4 pb-3 flex items-center gap-2">
        <StatusSelect v-model="activeStatus" :options="STATUS_TABS" @update:model-value="reload()" />
        <DateRangePicker v-model:from="dateFrom" v-model:to="dateTo" @apply="reload()" />
      </div>
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Initial skeleton -->
      <template v-if="loading && invoices.length === 0">
        <div class="space-y-2.5">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl h-[96px] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error state -->
      <ErrorState v-else-if="error" title="Couldn't load invoices" :message="error" @retry="reload(true)" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="!loading && invoices.length === 0"
        title="No invoices found"
        subtitle="Try adjusting your search or status filter"
        :show-clear="!!(search || activeStatus || dateFrom || dateTo)"
        @clear="clearFilters"
      >
        <template #icon><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></template>
      </EmptyState>

      <!-- ── Invoice list ─────────────────────────────────────────────────── -->
      <div v-else class="space-y-2">
        <button
          v-for="si in invoices"
          :key="si.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex flex-col gap-1 text-left active:scale-[.98] transition-transform"
          @click="router.push({ name: 'InvoiceDetail', params: { name: si.name } })"
        >
          <!-- Top row: name + status badge -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-muted/80 truncate">{{ si.name }}</span>
            <StatusBadge :label="statusLabel(si)" :color-class="statusBadgeClass(si)" />
          </div>

          <!-- Customer name -->
          <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
            {{ si.customer_name || si.customer || '—' }}
          </p>

          <!-- Date + due date + amount -->
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] text-muted">
              {{ fmtDate(si.posting_date) }}
              <span v-if="si.due_date" class="ml-1">· Due {{ fmtDate(si.due_date) }}</span>
            </span>
            <span class="text-sm font-bold text-gray-800">
              {{ si.currency || 'AED' }} {{ fmt(si.grand_total) }}
            </span>
          </div>

          <!-- Outstanding amount (only for submitted, non-return, non-paid) -->
          <div v-if="si.docstatus === 1 && si.outstanding_amount > 0 && !si.is_return" class="flex justify-end">
            <span class="text-[11px] text-red-600/80 font-medium">
              Outstanding {{ si.currency || 'AED' }} {{ fmt(si.outstanding_amount) }}
            </span>
          </div>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more spinner -->
      <div v-if="loading && invoices.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End of results -->
      <p v-if="!hasMore && invoices.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ invoices.length }} invoice{{ invoices.length !== 1 ? 's' : '' }} shown —
      </p>
    </div>

    <!-- ── FAB — New Invoice ─────────────────────────────────────────────── -->
    <FloatingActionButton @click="router.push({ name: 'InvoiceNew' })" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoices'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useFormatters } from '@/composables/useFormatters'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import SearchBar from '@/components/shared/SearchBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator.vue'
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue'
import SortToggle from '@/components/shared/SortToggle.vue'
import StatusSelect from '@/components/shared/StatusSelect.vue'
import DateRangePicker from '@/components/shared/DateRangePicker.vue'

const router       = useRouter()
const invoiceStore = useInvoiceStore()
const scrollEl     = inject('scrollEl')  // provided by AppShell
const { fmt, fmtDate } = useFormatters()

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = ['All', 'Draft', 'Unpaid', 'Overdue', 'Paid', 'Return', 'Cancelled']

// ── Filter state ──────────────────────────────────────────────────────────────
const search       = ref('')
const activeStatus = ref('')
const sortBy       = ref('creation')
const dateFrom     = ref('')
const dateTo       = ref('')

const invoices    = ref([])
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
  invoices.value  = []
  nextStart.value = 0
  if (force) invoiceStore.invalidate()

  try {
    const res = await invoiceStore.fetchInvoices({
      search:   search.value,
      status:   activeStatus.value,
      sortBy:   sortBy.value,
      dateFrom: dateFrom.value,
      dateTo:   dateTo.value,
      start:    0,
    })
    invoices.value    = res.data ?? []
    hasMore.value     = res.hasMore
    nextStart.value   = invoices.value.length
    totalLoaded.value = invoices.value.length
  } catch (e) {
    console.error('[Invoices] reload failed', e)
    error.value = e?.message ?? 'Failed to load invoices'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await invoiceStore.fetchInvoices({
      search:   search.value,
      status:   activeStatus.value,
      sortBy:   sortBy.value,
      dateFrom: dateFrom.value,
      dateTo:   dateTo.value,
      start:    nextStart.value,
    })
    invoices.value    = [...invoices.value, ...(res.data ?? [])]
    hasMore.value     = res.hasMore
    nextStart.value   = invoices.value.length
    totalLoaded.value = invoices.value.length
  } catch (e) {
    console.error('[Invoices] loadMore failed', e)
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

function clearSearch()  { search.value = ''; reload() }
function clearFilters() { search.value = ''; activeStatus.value = ''; dateFrom.value = ''; dateTo.value = ''; reload() }

function statusLabel(si) {
  if (si.docstatus === 2) return 'Cancelled'
  if (si.docstatus === 0) return 'Draft'
  if (si.is_return)       return 'Return'
  return si.status || 'Unpaid'
}

function statusBadgeClass(si) {
  if (si.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (si.docstatus === 0) return 'bg-gray-100 text-gray-600'
  if (si.is_return)       return 'bg-purple-50 text-purple-700'
  const map = {
    Unpaid:  'bg-amber-50 text-amber-700',
    Overdue: 'bg-red-50 text-red-700',
    Paid:    'bg-green-50 text-green-700',
  }
  return map[si.status] ?? 'bg-gray-100 text-gray-600'
}

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await reload()
})
</script>

