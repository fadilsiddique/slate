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

      <!-- Filter row: Status dropdown + Date range -->
      <div class="px-4 pb-3 flex items-center gap-2">
        <!-- Status dropdown -->
        <div class="relative flex-1">
          <select
            v-model="activeStatus"
            class="w-full appearance-none bg-surface border border-muted/25 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none pr-7"
            @change="reload()"
          >
            <option value="">All Statuses</option>
            <option v-for="s in STATUS_TABS.slice(1)" :key="s" :value="s">{{ s }}</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

        <!-- Date range button -->
        <button
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors shrink-0 max-w-[160px]"
          :class="dateFrom || dateTo ? 'border-primary bg-primary/5 text-primary' : 'border-muted/25 bg-surface text-gray-600'"
          @click="openCalendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="truncate">{{ dateRangeLabel }}</span>
          <span
            v-if="dateFrom || dateTo"
            class="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
            @click.stop="clearDates"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        </button>
      </div>
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

    <!-- ── Calendar date range sheet ──────────────────────────────────────── -->
    <Transition name="sheet">
      <div
        v-if="calendarOpen"
        class="fixed inset-0 z-50 flex flex-col justify-end"
        style="max-width:480px;margin-inline:auto"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="calendarOpen = false" />

        <!-- Sheet -->
        <div class="relative bg-white rounded-t-3xl px-4 pt-3 pb-8 shadow-2xl">
          <div class="w-10 h-1 bg-muted/30 rounded-full mx-auto mb-4" />

          <!-- Month navigation -->
          <div class="flex items-center justify-between mb-3 px-1">
            <button
              class="w-8 h-8 rounded-xl bg-surface flex items-center justify-center active:bg-muted/20"
              @click="prevMonth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="text-sm font-bold text-gray-900">{{ MONTH_NAMES[calendarMonth] }} {{ calendarYear }}</span>
            <button
              class="w-8 h-8 rounded-xl bg-surface flex items-center justify-center active:bg-muted/20"
              @click="nextMonth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Weekday headers -->
          <div class="grid grid-cols-7 mb-1">
            <div
              v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']"
              :key="d"
              class="text-center text-[10px] font-semibold text-muted py-1"
            >{{ d }}</div>
          </div>

          <!-- Day grid -->
          <div class="grid grid-cols-7">
            <div v-for="(day, i) in calendarDays" :key="i" class="flex items-center justify-center py-0.5">
              <button
                v-if="day"
                class="w-9 h-9 text-sm font-medium transition-colors rounded-full flex items-center justify-center"
                :class="dayClass(day)"
                @click="selectDay(day)"
              >{{ parseInt(day.split('-')[2]) }}</button>
            </div>
          </div>

          <!-- Hint row -->
          <p
            class="text-[11px] text-center mt-3 min-h-[16px]"
            :class="tempFrom && tempTo ? 'text-primary font-semibold' : 'text-muted'"
          >
            {{ !tempFrom ? 'Tap a date to set start' : !tempTo ? 'Tap a date to set end' : `${fmtDate(tempFrom)} — ${fmtDate(tempTo)}` }}
          </p>

          <!-- Action buttons -->
          <div class="flex gap-2 mt-4">
            <button
              class="flex-1 py-2.5 rounded-xl border border-muted/30 text-sm font-semibold text-gray-600 active:bg-surface"
              @click="clearDatesFromCalendar"
            >Clear</button>
            <button
              class="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-colors"
              :class="tempFrom ? 'bg-primary text-white active:bg-primary/90' : 'bg-muted/20 text-muted'"
              :disabled="!tempFrom"
              @click="applyDates"
            >Apply</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
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

const router         = useRouter()
const quotationStore = useQuotationStore()
const scrollEl       = inject('scrollEl')
const { fmt, fmtDate } = useFormatters()

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_TABS  = ['All', 'Draft', 'Open', 'Replied', 'Ordered', 'Lost', 'Cancelled']
const SORT_OPTIONS = [{ key: 'creation', label: 'Created' }, { key: 'modified', label: 'Updated' }]
const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December']

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

// ── Calendar state ────────────────────────────────────────────────────────────
const calendarOpen  = ref(false)
const calendarYear  = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth())
const tempFrom      = ref('')
const tempTo        = ref('')

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
function clearSearch()   { search.value = ''; reload() }
function clearDates()    { dateFrom.value = ''; dateTo.value = ''; reload() }
function clearFilters()  { search.value = ''; activeStatus.value = ''; dateFrom.value = ''; dateTo.value = ''; reload() }
function openQuotation(q) { router.push({ name: 'QuotationDetail', params: { name: q.name } }) }

// ── Calendar ──────────────────────────────────────────────────────────────────
const calendarDays = computed(() => {
  const y = calendarYear.value
  const m = calendarMonth.value
  const firstDow   = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const days = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return days
})

const dateRangeLabel = computed(() => {
  if (dateFrom.value && dateTo.value) return `${fmtDate(dateFrom.value)} – ${fmtDate(dateTo.value)}`
  if (dateFrom.value) return `From ${fmtDate(dateFrom.value)}`
  if (dateTo.value)   return `To ${fmtDate(dateTo.value)}`
  return 'Date range'
})

function openCalendar() {
  tempFrom.value = dateFrom.value
  tempTo.value   = dateTo.value
  const d = dateFrom.value ? new Date(dateFrom.value + 'T00:00:00') : new Date()
  calendarYear.value  = d.getFullYear()
  calendarMonth.value = d.getMonth()
  calendarOpen.value  = true
}

function prevMonth() {
  if (calendarMonth.value === 0) { calendarMonth.value = 11; calendarYear.value-- }
  else calendarMonth.value--
}

function nextMonth() {
  if (calendarMonth.value === 11) { calendarMonth.value = 0; calendarYear.value++ }
  else calendarMonth.value++
}

function selectDay(dateStr) {
  if (!tempFrom.value || (tempFrom.value && tempTo.value)) {
    tempFrom.value = dateStr
    tempTo.value   = ''
  } else if (dateStr === tempFrom.value) {
    tempFrom.value = ''
  } else if (dateStr < tempFrom.value) {
    tempTo.value   = tempFrom.value
    tempFrom.value = dateStr
  } else {
    tempTo.value = dateStr
  }
}

function dayClass(dateStr) {
  const isFrom  = dateStr === tempFrom.value
  const isTo    = dateStr === tempTo.value
  const inRange = tempFrom.value && tempTo.value && dateStr > tempFrom.value && dateStr < tempTo.value
  const today   = new Date().toISOString().slice(0, 10)
  if (isFrom || isTo) return 'bg-primary text-white'
  if (inRange)        return 'bg-primary/15 text-primary'
  if (dateStr === today) return 'border border-primary/40 text-primary font-semibold'
  return 'text-gray-700 hover:bg-surface'
}

function applyDates() {
  dateFrom.value = tempFrom.value
  dateTo.value   = tempTo.value
  calendarOpen.value = false
  reload()
}

function clearDatesFromCalendar() {
  tempFrom.value = ''
  tempTo.value   = ''
  dateFrom.value = ''
  dateTo.value   = ''
  calendarOpen.value = false
  reload()
}

// ── Status badge helpers ──────────────────────────────────────────────────────
function statusLabel(q) {
  if (q.docstatus === 2) return 'Cancelled'
  if (q.docstatus === 0) return 'Draft'
  return q.status || 'Open'
}

function statusBadgeClass(q) {
  if (q.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (q.docstatus === 0) return 'bg-gray-100 text-gray-600'
  const map = {
    Open:    'bg-primary/10 text-primary',
    Replied: 'bg-amber-50 text-amber-700',
    Ordered: 'bg-green-50 text-green-700',
    Lost:    'bg-red-50 text-red-600',
  }
  return map[q.status] ?? 'bg-gray-100 text-gray-600'
}

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await reload()
})
</script>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: transform 0.25s ease; }
.sheet-enter-from,   .sheet-leave-to     { transform: translateY(100%); }
</style>
