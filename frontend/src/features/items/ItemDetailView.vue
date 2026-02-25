<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading skeleton ────────────────────────────────────────────────── -->
    <template v-if="loading">
      <div class="absolute top-0 left-0 right-0 h-14 bg-white/80 border-b border-muted/20 z-10" />
      <div class="pt-16 px-4 pb-4 space-y-4">
        <div class="bg-white rounded-2xl p-5 border border-muted/20">
          <div class="w-24 h-3 bg-muted/20 rounded animate-pulse mb-3" />
          <div class="w-52 h-6 bg-muted/20 rounded animate-pulse mb-2" />
          <div class="w-32 h-4 bg-muted/20 rounded animate-pulse" />
        </div>
        <div v-for="n in 3" :key="n" class="h-24 bg-white rounded-2xl animate-pulse border border-muted/20" />
      </div>
    </template>

    <!-- ── Error state ─────────────────────────────────────────────────────── -->
    <template v-else-if="error">
      <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm flex items-center gap-3 px-4 py-4">
        <button
          class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">Item</h1>
      </header>
      <ErrorState title="Item not found" :message="error" retry-label="Retry" @retry="reload" />
    </template>

    <!-- ── Loaded ──────────────────────────────────────────────────────────── -->
    <template v-else-if="item">

      <!-- Absolute top nav -->
      <DetailTopNav @back="router.back()" />

      <!-- Content -->
      <div class="pt-16">

        <!-- Full-bleed image carousel (only when images exist) -->
        <div v-if="carouselImages.length > 0" class="relative bg-surface">
          <div
            ref="carouselRef"
            class="overflow-x-auto snap-x snap-mandatory flex"
            style="scrollbar-width: none;"
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
              :class="currentSlide === i ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-muted/40'"
            />
          </div>
          <!-- Counter badge -->
          <div
            v-if="carouselImages.length > 1"
            class="absolute top-3 right-3 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
          >
            {{ currentSlide + 1 }}/{{ carouselImages.length }}
          </div>
        </div>

        <!-- Cards -->
        <div class="px-4 pt-4 pb-8 space-y-4">

          <!-- Header card -->
          <div class="bg-white rounded-2xl px-5 py-4 border border-muted/20 shadow-sm">
            <p class="text-[11px] font-mono text-muted/80 mb-2">{{ item.item_code }}</p>
            <h1 class="text-xl font-bold text-gray-900 leading-tight">{{ item.item_name }}</h1>
            <p class="text-xs text-primary font-medium mt-1">
              {{ item.item_group }}<span v-if="item.brand"> · {{ item.brand }}</span>
            </p>
            <div v-if="item.variant_of" class="mt-2">
              <span class="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>
                </svg>
                Variant of {{ item.variant_of }}
              </span>
            </div>
          </div>

          <!-- Pricing card -->
          <SectionCard title="Pricing">
            <div class="divide-y divide-muted/10">
              <div class="flex items-center justify-between px-4 py-3">
                <p class="text-sm text-gray-600">Standard Rate</p>
                <p class="text-sm font-bold text-gray-900">
                  {{ item.standard_rate ? fmt(item.standard_rate) : '—' }}
                  <span class="text-xs font-normal text-muted">/ {{ item.stock_uom }}</span>
                </p>
              </div>
              <div
                v-for="price in item.prices ?? []"
                :key="price.price_list"
                class="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p class="text-sm text-gray-600">{{ price.price_list }}</p>
                  <p v-if="price.uom && price.uom !== item.stock_uom" class="text-[10px] text-muted">per {{ price.uom }}</p>
                </div>
                <p class="text-sm font-semibold text-gray-900">{{ price.currency }} {{ fmt(price.price_list_rate) }}</p>
              </div>
              <div v-if="!item.standard_rate && !(item.prices?.length)" class="px-4 py-3 text-sm text-muted italic">
                No pricing configured
              </div>
            </div>
          </SectionCard>

          <!-- Stock availability card -->
          <SectionCard v-if="item.is_stock_item" title="Stock">
            <div class="divide-y divide-muted/10">
              <!-- Banner -->
              <div
                class="flex items-center gap-3 px-4 py-3"
                :class="stock.inStock ? 'bg-green-50' : 'bg-red-50'"
              >
                <div class="w-2 h-2 rounded-full shrink-0" :class="stock.inStock ? 'bg-green-500' : 'bg-red-400'" />
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
                class="flex items-center justify-between px-4 py-2.5"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm text-gray-700 truncate">{{ bin.warehouse }}</p>
                  <p v-if="bin.reserved_qty > 0" class="text-[10px] text-amber-600">{{ bin.reserved_qty }} reserved</p>
                </div>
                <span class="text-sm font-bold ml-3" :class="bin.actual_qty > 0 ? 'text-gray-900' : 'text-red-400'">
                  {{ bin.actual_qty }}
                </span>
              </div>
              <div v-if="stock.warehouses.length === 0" class="px-4 py-3 text-sm text-muted italic">
                No stock data
              </div>
            </div>
          </SectionCard>

          <!-- Description card -->
          <SectionCard v-if="item.description" title="Description">
            <div
              class="px-4 py-3 text-sm text-gray-700 leading-relaxed desc-html"
              v-html="sanitizeHtml(item.description)"
            />
          </SectionCard>

          <!-- Attributes card -->
          <SectionCard v-if="item.attributes?.length > 0" title="Specifications">
            <div class="divide-y divide-muted/10">
              <div
                v-for="attr in item.attributes"
                :key="attr.attribute"
                class="flex items-center justify-between px-4 py-2.5"
              >
                <p class="text-sm text-muted">{{ attr.attribute }}</p>
                <p class="text-sm font-semibold text-gray-900">{{ attr.attribute_value }}</p>
              </div>
            </div>
          </SectionCard>

          <!-- Variants card -->
          <SectionCard v-if="item.has_variants && item.variants?.length > 0" :title="`Variants (${item.variants.length})`">
            <div class="px-4 py-3 flex flex-wrap gap-2">
              <button
                v-for="v in item.variants"
                :key="v.name"
                class="px-3 py-1.5 bg-white border-2 rounded-xl text-sm font-medium transition-colors active:scale-95"
                :class="activeVariant === v.name
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-muted/40 text-gray-700'"
                @click="goToVariant(v)"
              >
                {{ v.item_name.replace(item.item_name, '').trim().replace(/^-/, '').trim() || v.item_code }}
              </button>
            </div>
          </SectionCard>

        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/items'
import { useFormatters } from '@/composables/useFormatters'
import ErrorState from '@/components/shared/ErrorState.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import DetailTopNav from '@/components/shared/DetailTopNav.vue'

const route     = useRoute()
const router    = useRouter()
const itemStore = useItemStore()
const { fmt }   = useFormatters()

const itemCode = route.params.itemCode

// ── State ─────────────────────────────────────────────────────────────────────
const item          = ref(null)
const loading       = ref(true)
const error         = ref('')
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
function goToVariant(v) {
  activeVariant.value = v.name
  router.push({ name: 'ItemDetail', params: { itemCode: v.name } })
}

function sanitizeHtml(html) {
  return (html ?? '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

onMounted(reload)
</script>

<style scoped>
.desc-html :deep(p)      { margin-bottom: 0.375rem; line-height: 1.6; }
.desc-html :deep(ul)     { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.375rem; }
.desc-html :deep(ol)     { list-style: decimal; padding-left: 1.25rem; margin-bottom: 0.375rem; }
.desc-html :deep(strong) { font-weight: 600; }
.desc-html :deep(em)     { font-style: italic; }
</style>
