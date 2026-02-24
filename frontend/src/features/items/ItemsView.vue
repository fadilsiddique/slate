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
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Search items…"
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
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="text-gray-700 font-semibold">Couldn't load items</p>
        <p class="text-red-400 text-xs mt-1 px-6 break-all">{{ error }}</p>
        <button
          class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
          @click="reload(true)"
        >Try again</button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!loading && items.length === 0"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <p class="text-gray-700 font-semibold">No items found</p>
        <p class="text-muted text-sm mt-1">Try adjusting your search or filters</p>
        <button
          v-if="search || activeGroup || activeBrand"
          class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
          @click="clearFilters"
        >Clear filters</button>
      </div>

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
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItemStore } from '@/stores/items'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const router    = useRouter()
const itemStore = useItemStore()
const scrollEl  = inject('scrollEl') // provided by AppShell

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

const _fmtNum = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function fmt(v) { return _fmtNum.format(v) }

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
