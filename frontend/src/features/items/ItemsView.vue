<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <!-- Title row -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2.5">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Items</h1>
          <p v-if="!loading && totalLoaded > 0" class="text-xs text-muted mt-0.5">
            {{ totalLoaded }} item{{ totalLoaded !== 1 ? 's' : '' }}
          </p>
        </div>
        <!-- Grid / List toggle -->
        <div class="flex items-center gap-0.5 bg-surface p-0.5 rounded-lg">
          <button
            v-for="mode in ['list', 'grid']"
            :key="mode"
            class="p-1.5 rounded-md transition-colors"
            :class="viewMode === mode ? 'bg-white shadow text-primary' : 'text-muted'"
            @click="viewMode = mode"
          >
            <svg v-if="mode === 'list'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="px-4 pb-3">
        <SearchBar
          v-model="search"
          placeholder="Search items…"
          @input="debouncedReload"
          @clear="clearSearch"
        />
      </div>

      <!-- Filter chips — Item Group -->
      <div
        v-if="itemStore.itemGroups.length > 0"
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
          v-for="g in itemStore.itemGroups"
          :key="g"
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
          :class="activeGroup === g
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-600 border-muted/40 hover:border-primary/40'"
          @click="setGroup(g)"
        >{{ g }}</button>
      </div>

      <!-- Filter chips — Brand -->
      <div
        v-if="itemStore.brands.length > 0"
        class="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none"
      >
        <button
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
          :class="activeBrand === ''
            ? 'bg-accent text-white border-accent'
            : 'bg-white text-gray-500 border-muted/40 hover:border-accent/40'"
          @click="setBrand('')"
        >All Brands</button>
        <button
          v-for="b in itemStore.brands"
          :key="b"
          class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
          :class="activeBrand === b
            ? 'bg-accent text-white border-accent'
            : 'bg-white text-gray-500 border-muted/40 hover:border-accent/40'"
          @click="setBrand(b)"
        >{{ b }}</button>
      </div>
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Initial skeleton -->
      <template v-if="loading && items.length === 0">
        <div v-if="viewMode === 'list'" class="space-y-2.5">
          <div v-for="n in 8" :key="n" class="bg-white rounded-2xl h-[72px] animate-pulse border border-muted/20" />
        </div>
        <div v-else class="grid grid-cols-2 gap-3">
          <div v-for="n in 6" :key="n" class="bg-white rounded-2xl aspect-[3/4] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error state -->
      <ErrorState v-else-if="error" title="Couldn't load items" :message="error" @retry="reload(true)" />

      <!-- Empty state -->
      <EmptyState
        v-else-if="!loading && items.length === 0"
        title="No items found"
        subtitle="Try adjusting your search or filters"
        :show-clear="!!(search || activeGroup || activeBrand)"
        @clear="clearFilters"
      >
        <template #icon><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></template>
      </EmptyState>

      <!-- ── List view ──────────────────────────────────────────────────── -->
      <div v-else-if="viewMode === 'list'" class="space-y-2">
        <button
          v-for="item in items"
          :key="item.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex items-center gap-3 text-left active:scale-[.98] transition-transform"
          @click="openItem(item)"
        >
          <!-- Thumbnail -->
          <div class="w-12 h-12 rounded-xl bg-surface border border-muted/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.item_name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 truncate leading-tight">{{ item.item_name }}</p>
            <p class="text-[11px] text-muted mt-0.5 truncate">{{ item.item_code }}</p>
            <span
              v-if="item.item_group"
              class="inline-block mt-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium"
            >{{ item.item_group }}</span>
          </div>

          <div class="text-right shrink-0 ml-1">
            <p class="text-sm font-bold text-gray-900">
              {{ item.standard_rate ? fmt(item.standard_rate) : '—' }}
            </p>
            <p class="text-[10px] text-muted mt-0.5">/ {{ item.stock_uom }}</p>
          </div>

          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <!-- ── Grid view ──────────────────────────────────────────────────── -->
      <div v-else class="grid grid-cols-2 gap-3">
        <button
          v-for="item in items"
          :key="item.name"
          class="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden text-left active:scale-[.97] transition-transform flex flex-col"
          @click="openItem(item)"
        >
          <!-- Image -->
          <div class="aspect-square bg-surface flex items-center justify-center overflow-hidden">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.item_name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>

          <!-- Info -->
          <div class="p-3 flex flex-col gap-1 flex-1">
            <p class="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">{{ item.item_name }}</p>
            <p class="text-[10px] text-muted truncate">{{ item.item_code }}</p>
            <div class="mt-auto pt-2 flex items-end justify-between">
              <div>
                <p class="text-sm font-bold text-primary">
                  {{ item.standard_rate ? fmt(item.standard_rate) : '—' }}
                </p>
                <p class="text-[9px] text-muted">/ {{ item.stock_uom }}</p>
              </div>
              <span
                v-if="item.has_variants"
                class="text-[9px] font-medium bg-accent/10 text-accent px-1.5 py-0.5 rounded"
              >Variants</span>
            </div>
          </div>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more spinner -->
      <div v-if="loading && items.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End of results indicator -->
      <p v-if="!hasMore && items.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ items.length }} items shown —
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/items'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useFormatters } from '@/composables/useFormatters'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import SearchBar from '@/components/shared/SearchBar.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator.vue'

const router    = useRouter()
const itemStore = useItemStore()
const scrollEl  = inject('scrollEl') // provided by AppShell
const { fmt } = useFormatters()

// ── Display state ─────────────────────────────────────────────────────────────
const viewMode    = ref('list')
const search      = ref('')
const activeGroup = ref('')
const activeBrand = ref('')

const items       = ref([])
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
  items.value     = []
  nextStart.value = 0
  if (force) itemStore.invalidate()

  try {
    const res = await itemStore.fetchItems({
      search: search.value,
      group:  activeGroup.value,
      brand:  activeBrand.value,
      start:  0,
    })
    items.value       = res.data ?? []
    hasMore.value      = res.hasMore
    nextStart.value    = items.value.length
    totalLoaded.value  = items.value.length
  } catch (e) {
    console.error('[Items] reload failed', e)
    error.value = e?.message ?? 'Failed to load items'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await itemStore.fetchItems({
      search: search.value,
      group:  activeGroup.value,
      brand:  activeBrand.value,
      start:  nextStart.value,
    })
    items.value      = [...items.value, ...(res.data ?? [])]
    hasMore.value     = res.hasMore
    nextStart.value   = items.value.length
    totalLoaded.value = items.value.length
  } catch (e) {
    console.error('[Items] loadMore failed', e)
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

function setGroup(g) { activeGroup.value = g; reload() }
function setBrand(b) { activeBrand.value = b; reload() }
function clearSearch() { search.value = ''; reload() }
function clearFilters() { search.value = ''; activeGroup.value = ''; activeBrand.value = ''; reload() }
function openItem(item) { router.push({ name: 'ItemDetail', params: { itemCode: item.name } }) }

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  itemStore.fetchFilterOptions().catch(() => {})
  await reload()
})
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
