<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading state ─────────────────────────────────────────────────── -->
    <template v-if="loading">
      <!-- Back button skeleton -->
      <div class="flex items-center gap-3 px-4 pt-4 pb-3">
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
        <div class="w-32 h-4 bg-surface rounded animate-pulse" />
      </div>
      <div class="w-full aspect-square bg-muted/20 animate-pulse" />
      <div class="p-4 space-y-3">
        <div class="h-6 w-3/4 bg-surface rounded animate-pulse" />
        <div class="h-4 w-1/3 bg-surface rounded animate-pulse" />
        <div class="h-4 w-1/2 bg-surface rounded animate-pulse" />
      </div>
    </template>

    <!-- ── Error state ────────────────────────────────────────────────────── -->
    <template v-else-if="error">
      <button
        class="flex items-center gap-2 px-4 pt-5 pb-3 text-muted"
        @click="router.back()"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back
      </button>
      <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="font-semibold text-gray-800">Item not found</p>
        <p class="text-sm text-gray-400 mt-1">{{ error }}</p>
        <button class="mt-5 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold" @click="reload">
          Retry
        </button>
      </div>
    </template>

    <!-- ── Loaded ─────────────────────────────────────────────────────────── -->
    <template v-else-if="item">

      <!-- Top nav bar -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2 absolute top-0 left-0 right-0 z-10">
        <button
          class="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-sm border border-muted/30 flex items-center justify-center shadow-sm"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          class="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-sm border border-muted/30 flex items-center justify-center shadow-sm"
          @click="toggleFavourite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="isFav ? 'text-red-500 fill-red-500' : 'text-gray-500'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <!-- ── Image carousel ──────────────────────────────────────────────── -->
      <div class="relative bg-surface">
        <!-- Swipeable image strip -->
        <div
          ref="carouselRef"
          class="overflow-x-auto snap-x snap-mandatory flex scroll-smooth"
          style="scroll-behavior: smooth; scrollbar-width: none;"
          @scroll="onCarouselScroll"
        >
          <div
            v-for="(img, i) in carouselImages"
            :key="i"
            class="snap-center shrink-0 w-full aspect-square flex items-center justify-center bg-surface"
          >
            <img
              :src="img"
              :alt="`${item.item_name} — image ${i + 1}`"
              class="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          <!-- Fallback when no images -->
          <div
            v-if="carouselImages.length === 0"
            class="snap-center shrink-0 w-full aspect-square flex flex-col items-center justify-center text-muted/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p class="text-sm text-gray-300">No image</p>
          </div>
        </div>

        <!-- Dot indicators -->
        <div
          v-if="carouselImages.length > 1"
          class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5"
        >
          <div
            v-for="(_, i) in carouselImages"
            :key="i"
            class="rounded-full transition-all duration-200"
            :class="currentSlide === i
              ? 'w-4 h-1.5 bg-primary'
              : 'w-1.5 h-1.5 bg-muted/40'"
          />
        </div>

        <!-- Image counter badge -->
        <div
          v-if="carouselImages.length > 1"
          class="absolute top-14 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
        >
          {{ currentSlide + 1 }}/{{ carouselImages.length }}
        </div>
      </div>

      <!-- ── Item info ───────────────────────────────────────────────────── -->
      <div class="px-4 pt-4 pb-2">
        <!-- Breadcrumb -->
        <p class="text-xs text-primary font-medium mb-1">
          {{ item.item_group }}<span v-if="item.brand"> · {{ item.brand }}</span>
        </p>

        <!-- Name -->
        <h1 class="text-xl font-bold text-gray-900 leading-tight">{{ item.item_name }}</h1>

        <!-- Code -->
        <p class="text-xs text-gray-400 mt-1 font-mono"># {{ item.item_code }}</p>

        <!-- Variant badge -->
        <div v-if="item.variant_of" class="mt-2">
          <span class="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>
            </svg>
            Variant of {{ item.variant_of }}
          </span>
        </div>
      </div>

      <div class="px-4 space-y-5 pb-32">

        <!-- ── Pricing ─────────────────────────────────────────────────── -->
        <section>
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Pricing</h2>
          <div class="bg-surface rounded-2xl divide-y divide-muted/20 overflow-hidden">
            <!-- Standard rate -->
            <div class="flex items-center justify-between px-4 py-3">
              <p class="text-sm text-gray-600">Standard Rate</p>
              <p class="text-base font-bold text-gray-900">
                {{ item.standard_rate ? fmt(item.standard_rate) : '—' }}
                <span class="text-xs font-normal text-gray-400">/ {{ item.stock_uom }}</span>
              </p>
            </div>
            <!-- Price list rates -->
            <div
              v-for="price in item.prices"
              :key="price.price_list"
              class="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p class="text-sm text-gray-600">{{ price.price_list }}</p>
                <p v-if="price.uom && price.uom !== item.stock_uom" class="text-[10px] text-gray-400">per {{ price.uom }}</p>
              </div>
              <p class="text-sm font-semibold text-gray-900">
                {{ price.currency }} {{ fmt(price.price_list_rate) }}
              </p>
            </div>
            <!-- No prices -->
            <div v-if="!item.standard_rate && item.prices.length === 0" class="px-4 py-3 text-sm text-gray-400 italic">
              No pricing configured
            </div>
          </div>
        </section>

        <!-- ── Stock availability ──────────────────────────────────────── -->
        <section v-if="item.is_stock_item">
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Stock Availability</h2>
          <div class="bg-surface rounded-2xl overflow-hidden">
            <!-- Total stock banner -->
            <div
              class="flex items-center gap-3 px-4 py-3 border-b border-muted/20"
              :class="stock.inStock ? 'bg-green-50' : 'bg-red-50'"
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="stock.inStock ? 'bg-green-500' : 'bg-red-400'"
              />
              <div class="flex-1">
                <p class="text-sm font-semibold" :class="stock.inStock ? 'text-green-800' : 'text-red-700'">
                  {{ stock.inStock ? 'In Stock' : 'Out of Stock' }}
                </p>
                <p class="text-xs" :class="stock.inStock ? 'text-green-600' : 'text-red-500'">
                  Total: {{ stock.total }} {{ item.stock_uom }}
                </p>
              </div>
            </div>
            <!-- Per-warehouse breakdown -->
            <div
              v-for="bin in stock.warehouses"
              :key="bin.warehouse"
              class="flex items-center justify-between px-4 py-2.5 border-b border-muted/20 last:border-0"
            >
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-700 truncate">{{ bin.warehouse }}</p>
                <p v-if="bin.reserved_qty > 0" class="text-[10px] text-amber-600">
                  {{ bin.reserved_qty }} reserved
                </p>
              </div>
              <span
                class="text-sm font-bold ml-3"
                :class="bin.actual_qty > 0 ? 'text-gray-900' : 'text-red-400'"
              >
                {{ bin.actual_qty }}
              </span>
            </div>
            <!-- No stock data -->
            <div v-if="stock.warehouses.length === 0" class="px-4 py-3 text-sm text-gray-400 italic">
              No stock data
            </div>
          </div>
        </section>

        <!-- ── Description ─────────────────────────────────────────────── -->
        <section v-if="item.description">
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Description</h2>
          <div
            class="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
            v-html="sanitizeHtml(item.description)"
          />
        </section>

        <!-- ── Attributes (variant) ────────────────────────────────────── -->
        <section v-if="item.attributes?.length > 0">
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Specifications</h2>
          <div class="bg-surface rounded-2xl divide-y divide-muted/20 overflow-hidden">
            <div
              v-for="attr in item.attributes"
              :key="attr.attribute"
              class="flex items-center justify-between px-4 py-2.5"
            >
              <p class="text-sm text-muted">{{ attr.attribute }}</p>
              <p class="text-sm font-semibold text-gray-900">{{ attr.attribute_value }}</p>
            </div>
          </div>
        </section>

        <!-- ── Variants ────────────────────────────────────────────────── -->
        <section v-if="item.has_variants && item.variants.length > 0">
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">
            Variants ({{ item.variants.length }})
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in item.variants"
              :key="v.name"
              class="px-3 py-1.5 bg-white border-2 rounded-xl text-sm font-medium transition-colors active:scale-95"
              :class="activeVariant === v.name
                ? 'border-primary text-primary bg-primary/5'
                : 'border-muted/40 text-gray-700 hover:border-gray-300'"
              @click="goToVariant(v)"
            >
              {{ v.item_name.replace(item.item_name, '').trim().replace(/^-/, '').trim() || v.item_code }}
            </button>
          </div>
        </section>
      </div>

      <!-- ── Sticky CTA footer ──────────────────────────────────────────── -->
      <div
        class="fixed bottom-16 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-muted/20 px-4 py-3 shadow-lg"
        style="max-width: 480px; margin-inline: auto;"
      >
        <div class="flex items-center gap-3">
          <!-- Qty stepper -->
          <div class="flex items-center gap-2 bg-surface rounded-xl px-3 py-2">
            <button
              class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 active:scale-90 transition"
              @click="qty = Math.max(1, qty - 1)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <span class="w-6 text-center text-sm font-bold text-gray-900">{{ qty }}</span>
            <button
              class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-gray-900 active:scale-90 transition"
              @click="qty++"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>

          <!-- Add to cart button -->
          <button
            class="flex-1 bg-primary text-white rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="addedFeedback ? 'bg-green-600' : 'bg-primary'"
            @click="addToCart"
          >
            <svg v-if="!addedFeedback" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {{ addedFeedback ? 'Added!' : `Add ${qty > 1 ? qty + '× ' : ''}to Cart` }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/items'
import { useCartStore } from '@/stores/cart'

const route     = useRoute()
const router    = useRouter()
const itemStore = useItemStore()
const cart      = useCartStore()

const itemCode = route.params.itemCode

// ── State ─────────────────────────────────────────────────────────────────────
const item          = ref(null)
const loading       = ref(true)
const error         = ref('')
const qty           = ref(1)
const isFav         = ref(false)
const addedFeedback = ref(false)
const activeVariant = ref(null)

// ── Carousel ──────────────────────────────────────────────────────────────────
const carouselRef  = ref(null)
const currentSlide = ref(0)

const carouselImages = computed(() => {
  if (!item.value) return []
  const imgs = new Set()
  if (item.value.image)         imgs.add(item.value.image)
  if (item.value.website_image) imgs.add(item.value.website_image)
  return [...imgs].filter(Boolean)
})

function onCarouselScroll(e) {
  const el = e.target
  currentSlide.value = Math.round(el.scrollLeft / (el.clientWidth || 1))
}

// ── Stock summary ─────────────────────────────────────────────────────────────
const stock = computed(() => itemStore.stockSummary(item.value?.bins ?? []))

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function reload() {
  loading.value = true
  error.value   = ''
  try {
    item.value = await itemStore.fetchItemDetail(itemCode)
  } catch (e) {
    error.value = e?.message ?? 'Could not load item'
  } finally {
    loading.value = false
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
function addToCart() {
  if (!item.value) return
  cart.addItem({
    item_code: item.value.item_code,
    item_name: item.value.item_name,
    rate:      item.value.standard_rate ?? 0,
    uom:       item.value.stock_uom ?? 'Nos',
    qty:       qty.value,
  })
  addedFeedback.value = true
  setTimeout(() => { addedFeedback.value = false }, 1800)
}

function goToVariant(v) {
  activeVariant.value = v.name
  router.push({ name: 'ItemDetail', params: { itemCode: v.name } })
}

function toggleFavourite() { isFav.value = !isFav.value }

// ── HTML sanitizer (very basic — strip script tags) ───────────────────────────
function sanitizeHtml(html) {
  return (html ?? '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

// ── Currency formatter ────────────────────────────────────────────────────────
const _fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function fmt(v) { return _fmt.format(v) }

onMounted(reload)
</script>

<style scoped>
/* Hide carousel scrollbar */
div[ref="carouselRef"]::-webkit-scrollbar { display: none; }

/* Basic prose-like styles for item description HTML */
:deep(p)  { margin-bottom: 0.5rem; }
:deep(ul) { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.5rem; }
:deep(strong) { font-weight: 600; }
</style>
