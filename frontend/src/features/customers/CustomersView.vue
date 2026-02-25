<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <!-- Title row -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2.5">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Customers</h1>
          <p v-if="!loading && totalLoaded > 0" class="text-xs text-muted mt-0.5">
            {{ totalLoaded }} customer{{ totalLoaded !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Search bar -->
      <div class="px-4 pb-3">
        <SearchBar
          v-model="search"
          placeholder="Search customers…"
          @input="debouncedReload"
          @clear="clearSearch"
        />
      </div>

      <!-- Filter chips — Customer Group (primary) -->
      <div
        v-if="customerStore.customerGroups.length > 0"
        class="flex gap-2 px-4 pb-2 overflow-x-auto scrollbar-none"
      >
        <button
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
          :class="activeGroup === ''
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-600 border-muted/40 hover:border-primary/40'"
          @click="setGroup('')"
        >All</button>
        <button
          v-for="g in customerStore.customerGroups"
          :key="g"
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
          :class="activeGroup === g
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-600 border-muted/40 hover:border-primary/40'"
          @click="setGroup(g)"
        >{{ g }}</button>
      </div>

      <!-- Filter chips — Territory (accent) -->
      <div
        v-if="customerStore.territories.length > 0"
        class="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none"
      >
        <button
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
          :class="activeTerritory === ''
            ? 'bg-accent text-white border-accent'
            : 'bg-white text-gray-500 border-muted/40 hover:border-accent/40'"
          @click="setTerritory('')"
        >All Territories</button>
        <button
          v-for="t in customerStore.territories"
          :key="t"
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
          :class="activeTerritory === t
            ? 'bg-accent text-white border-accent'
            : 'bg-white text-gray-500 border-muted/40 hover:border-accent/40'"
          @click="setTerritory(t)"
        >{{ t }}</button>
      </div>
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Initial skeleton -->
      <template v-if="loading && customers.length === 0">
        <div class="space-y-2.5">
          <div v-for="n in 8" :key="n" class="bg-white rounded-2xl h-[72px] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error state -->
      <ErrorState v-else-if="error" title="Couldn't load customers" :message="error" @retry="reload(true)" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="!loading && customers.length === 0"
        title="No customers found"
        subtitle="Try adjusting your search or filters"
        :show-clear="!!(search || activeGroup || activeTerritory)"
        @clear="clearFilters"
      >
        <template #icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></template>
      </EmptyState>

      <!-- ── Customer list ───────────────────────────────────────────────── -->
      <div v-else class="space-y-2">
        <button
          v-for="c in customers"
          :key="c.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex items-center gap-3 text-left active:scale-[.98] transition-transform"
          @click="openCustomer(c)"
        >
          <!-- Initials avatar -->
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
            {{ initials(c.customer_name) }}
          </div>

          <!-- Text content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate leading-tight">
              {{ c.customer_name }}
            </p>
            <span
              class="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] rounded font-medium"
              :class="c.customer_type === 'Company'
                ? 'bg-primary/10 text-primary'
                : 'bg-accent/10 text-accent'"
            >{{ c.customer_type || 'Individual' }}</span>
            <p v-if="c.mobile_no || c.email_id" class="text-[11px] text-muted mt-0.5 truncate">
              {{ c.mobile_no || c.email_id }}
            </p>
          </div>

          <!-- Chevron -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more spinner -->
      <div v-if="loading && customers.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End of results indicator -->
      <p v-if="!hasMore && customers.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ customers.length }} customer{{ customers.length !== 1 ? 's' : '' }} shown —
      </p>
    </div>

    <!-- ── FAB — New Customer ─────────────────────────────────────────────── -->
    <FloatingActionButton @click="router.push({ name: 'CustomerNew' })" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import SearchBar from '@/components/shared/SearchBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator.vue'
import FloatingActionButton from '@/components/shared/FloatingActionButton.vue'

const router        = useRouter()
const customerStore = useCustomerStore()
const scrollEl      = inject('scrollEl') // provided by AppShell

// ── Display state ─────────────────────────────────────────────────────────────
const search          = ref('')
const activeGroup     = ref('')
const activeTerritory = ref('')

const customers   = ref([])
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
  customers.value   = []
  nextStart.value   = 0
  if (force) customerStore.invalidate()

  try {
    const res = await customerStore.fetchCustomers({
      search:    search.value,
      group:     activeGroup.value,
      territory: activeTerritory.value,
      start:     0,
    })
    customers.value   = res.data ?? []
    hasMore.value     = res.hasMore
    nextStart.value   = customers.value.length
    totalLoaded.value = customers.value.length
  } catch (e) {
    console.error('[Customers] reload failed', e)
    error.value = e?.message ?? 'Failed to load customers'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await customerStore.fetchCustomers({
      search:    search.value,
      group:     activeGroup.value,
      territory: activeTerritory.value,
      start:     nextStart.value,
    })
    customers.value   = [...customers.value, ...(res.data ?? [])]
    hasMore.value     = res.hasMore
    nextStart.value   = customers.value.length
    totalLoaded.value = customers.value.length
  } catch (e) {
    console.error('[Customers] loadMore failed', e)
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

function setGroup(g)     { activeGroup.value = g; reload() }
function setTerritory(t) { activeTerritory.value = t; reload() }
function clearSearch()   { search.value = ''; reload() }
function clearFilters()  { search.value = ''; activeGroup.value = ''; activeTerritory.value = ''; reload() }
function openCustomer(c) { router.push({ name: 'CustomerDetail', params: { name: c.name } }) }

function initials(name) {
  return (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  customerStore.fetchFilterOptions().catch(() => {})
  await reload()
})
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
