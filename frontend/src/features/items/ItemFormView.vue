<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading (edit mode pre-fill) ──────────────────────────────────────── -->
    <template v-if="loadingInit">
      <div class="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-muted/20">
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
        <div class="w-40 h-5 bg-surface rounded animate-pulse" />
      </div>
      <div class="px-4 py-4 space-y-5">
        <div v-for="n in 5" :key="n" class="h-14 bg-white rounded-2xl animate-pulse border border-muted/20" />
      </div>
    </template>

    <template v-else>

      <!-- ── Header ────────────────────────────────────────────────────────── -->
      <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm flex items-center gap-3 px-4 py-4">
        <button
          class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="text-lg font-bold text-gray-900">{{ isEdit ? 'Edit Item' : 'New Item' }}</h1>
      </header>

      <!-- ── Error banner ──────────────────────────────────────────────────── -->
      <div
        v-if="saveError"
        class="mx-4 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
      >
        {{ saveError }}
      </div>

      <!-- ── Form ──────────────────────────────────────────────────────────── -->
      <div class="px-4 py-4 pb-44 space-y-5">

        <!-- Item Name -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="item_name">
            Item Name <span class="text-red-400">*</span>
          </label>
          <input
            id="item_name"
            v-model="itemName"
            type="text"
            placeholder="e.g. Premium Business Cards"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border transition"
            :class="submitted && !itemName.trim()
              ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300'
              : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
            style="outline:none"
          />
          <p v-if="submitted && !itemName.trim()" class="mt-1 text-xs text-red-500">Item name is required</p>
        </div>

        <!-- Item Code -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="item_code">
            Item Code
            <span class="text-muted font-normal">(auto-generated if blank)</span>
          </label>
          <input
            id="item_code"
            v-model="itemCode"
            type="text"
            placeholder="e.g. ITEM-0001"
            :readonly="isEdit"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary transition"
            :class="isEdit ? 'opacity-60 cursor-not-allowed' : ''"
            style="outline:none"
          />
        </div>

        <!-- Item Group -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Item Group <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <select
              v-model="itemGroup"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border transition appearance-none pr-9"
              :class="submitted && !itemGroup
                ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300'
                : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
              style="outline:none"
            >
              <option value="">Select group…</option>
              <option v-for="g in itemStore.itemGroups" :key="g" :value="g">{{ g }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <p v-if="submitted && !itemGroup" class="mt-1 text-xs text-red-500">Item group is required</p>
        </div>

        <!-- Stock UOM -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="stock_uom">
            Unit of Measure <span class="text-red-400">*</span>
          </label>
          <div class="relative">
            <select
              v-model="stockUom"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border transition appearance-none pr-9"
              :class="submitted && !stockUom
                ? 'border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-300'
                : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
              style="outline:none"
            >
              <option value="">Select UOM…</option>
              <option v-for="u in uomOptions" :key="u" :value="u">{{ u }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <p v-if="submitted && !stockUom" class="mt-1 text-xs text-red-500">UOM is required</p>
        </div>

        <!-- Standard Rate -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="standard_rate">
            Standard Rate
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">
              {{ currency }}
            </span>
            <input
              id="standard_rate"
              v-model.number="standardRate"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="w-full pl-12 pr-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary transition text-right"
              style="outline:none"
            />
          </div>
        </div>

        <!-- Is Stock Item -->
        <div>
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0"
              :class="isStockItem ? 'bg-primary' : 'bg-muted/30'"
              @click="isStockItem = !isStockItem"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                :class="isStockItem ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
            <div>
              <p class="text-sm font-semibold text-gray-700">Track Inventory</p>
              <p class="text-[11px] text-muted">Maintain stock levels for this item</p>
            </div>
          </label>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="description">
            Description
          </label>
          <textarea
            id="description"
            v-model="description"
            rows="3"
            placeholder="Optional item description…"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
            style="outline:none"
          />
        </div>

      </div>

      <!-- ── Sticky footer ──────────────────────────────────────────────────── -->
      <ActionFooter>
        <button
          type="button"
          class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
          :class="saving ? 'opacity-70 pointer-events-none' : ''"
          :disabled="saving"
          @click="handleSave"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Item') }}
        </button>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemStore } from '@/stores/items'
import { useDefaultsStore } from '@/stores/defaults'
import { api } from '@/composables/useApi'
import ActionFooter from '@/components/shared/ActionFooter.vue'

const route         = useRoute()
const router        = useRouter()
const itemStore     = useItemStore()
const defaultsStore = useDefaultsStore()

const isEdit   = route.name === 'ItemEdit'
const editCode = isEdit ? route.params.itemCode : null

// ── Form state ─────────────────────────────────────────────────────────────────
const itemName    = ref('')
const itemCode    = ref('')
const itemGroup   = ref('')
const stockUom    = ref('Nos')
const standardRate = ref(0)
const isStockItem = ref(true)
const description = ref('')

const currency    = ref('AED')
const uomOptions  = ref([
  'Nos', 'Pcs', 'Unit', 'Box', 'Set', 'Kg', 'g', 'L', 'ml',
  'm', 'cm', 'mm', 'Sq. m.', 'Hour', 'Day',
])

// ── UI state ───────────────────────────────────────────────────────────────────
const loadingInit = ref(true)
const saving      = ref(false)
const saveError   = ref(null)
const submitted   = ref(false)

// ── Validation ─────────────────────────────────────────────────────────────────
function isValid() {
  return itemName.value.trim() && itemGroup.value && stockUom.value
}

// ── Build document ─────────────────────────────────────────────────────────────
function buildDoc() {
  return {
    ...(isEdit ? { name: editCode } : {}),
    doctype:       'Item',
    item_name:     itemName.value.trim(),
    ...(itemCode.value.trim() && !isEdit ? { item_code: itemCode.value.trim() } : {}),
    item_group:    itemGroup.value,
    stock_uom:     stockUom.value,
    is_stock_item: isStockItem.value ? 1 : 0,
    ...(standardRate.value > 0 ? { standard_rate: standardRate.value } : {}),
    ...(description.value.trim() ? { description: description.value.trim() } : {}),
  }
}

// ── Save ───────────────────────────────────────────────────────────────────────
async function handleSave() {
  submitted.value = true
  if (!isValid()) return

  saving.value    = true
  saveError.value = null
  try {
    const saved = await itemStore.saveItem(buildDoc())
    const code  = saved?.item_code ?? saved?.name ?? editCode
    router.push({ name: 'ItemDetail', params: { itemCode: code } })
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to save item'
  } finally {
    saving.value = false
  }
}

// ── onMounted ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    defaultsStore.fetchDefaults(),
    itemStore.fetchFilterOptions(),
  ])
  currency.value = defaultsStore.currency || 'AED'

  // Fetch UOM list (best-effort — fall back to built-in list)
  try {
    const res = await api.getList('UOM', { fields: ['name'], filters: [['enabled', '=', 1]], limit: 100, orderBy: 'name asc' })
    const list = (res?.data ?? res ?? []).map(r => r.name).filter(Boolean)
    if (list.length) uomOptions.value = list
  } catch { /* keep defaults */ }

  if (isEdit) {
    try {
      const doc = await itemStore.fetchItemDetail(editCode)
      itemName.value     = doc.item_name     ?? ''
      itemCode.value     = doc.item_code     ?? ''
      itemGroup.value    = doc.item_group    ?? ''
      stockUom.value     = doc.stock_uom     ?? 'Nos'
      standardRate.value = doc.standard_rate ?? 0
      isStockItem.value  = !!doc.is_stock_item
      description.value  = doc.description   ?? ''
    } catch (e) {
      saveError.value = e?.message ?? 'Failed to load item'
    }
  }

  loadingInit.value = false
})
</script>
