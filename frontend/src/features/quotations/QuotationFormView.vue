<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading (edit mode pre-fill) ──────────────────────────────────────── -->
    <template v-if="loadingEdit">
      <div class="flex items-center gap-3 px-4 pt-4 pb-3 bg-white border-b border-muted/20">
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
        <div class="w-40 h-5 bg-surface rounded animate-pulse" />
      </div>
      <div class="px-4 py-4 space-y-5">
        <div v-for="n in 6" :key="n" class="h-14 bg-white rounded-2xl animate-pulse border border-muted/20" />
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
        <h1 class="text-lg font-bold text-gray-900">{{ pageTitle }}</h1>
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

        <!-- ── Customer ── -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Customer <span class="text-red-400">*</span>
          </label>
          <AutocompleteInput
            v-model="customerQuery"
            :results="normalizedCustomerResults"
            :error="submitted && v.customer"
            placeholder="Search customer…"
            @input="onCustomerInput"
            @focus="onCustomerFocus"
            @blur="hideCustomerResultsDelayed"
            @select="selectCustomer"
          />
          <p v-if="submitted && v.customer" class="mt-1 text-xs text-red-500">
            Customer is required
          </p>
        </div>

        <!-- ── Dates ── -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="transaction_date">
              Date
            </label>
            <input
              id="transaction_date"
              v-model="transactionDate"
              type="date"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="valid_till">
              Valid Till
            </label>
            <input
              id="valid_till"
              v-model="validTill"
              type="date"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
            />
          </div>
        </div>

        <!-- ── Items ── -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Items <span class="text-red-400">*</span>
          </label>

          <div class="space-y-3">
            <div
              v-for="(row, idx) in items"
              :key="row.id"
              class="bg-white rounded-2xl border border-muted/20 p-3 space-y-2"
              :class="submitted && !row.itemCode ? 'border-red-300' : ''"
            >
              <!-- Item search -->
              <div class="relative">
                <input
                  v-model="row.itemQuery"
                  type="text"
                  placeholder="Search item…"
                  autocomplete="off"
                  class="w-full px-3 py-2.5 text-sm bg-surface rounded-xl border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
                  @focus="onItemFocus(row)"
                  @input="onItemInput(row)"
                  @blur="hideItemResultsDelayed(row)"
                />
                <ul
                  v-if="row.itemResults?.length"
                  class="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-muted/30 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                >
                  <li
                    v-for="item in row.itemResults"
                    :key="item.item_code"
                    class="px-4 py-2.5 text-sm text-gray-800 hover:bg-surface cursor-pointer"
                    @mousedown.prevent="selectItem(row, item)"
                  >
                    {{ item.item_name }}
                    <span class="text-xs text-muted ml-1">{{ item.item_code }}</span>
                  </li>
                </ul>
              </div>

              <!-- Qty + Rate + Remove -->
              <div class="flex items-center gap-2">
                <div class="flex-1">
                  <label class="block text-[10px] text-muted mb-1">Qty</label>
                  <input
                    v-model.number="row.qty"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="1"
                    class="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition text-right"
                    @change="onQtyRateChange(row)"
                  />
                </div>
                <div class="flex-1">
                  <label class="block text-[10px] text-muted mb-1">Rate</label>
                  <div class="relative">
                    <input
                      v-model.number="row.rate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition text-right"
                    />
                    <svg
                      v-if="row.loading"
                      class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-primary/50"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    >
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <label class="block text-[10px] text-muted mb-1">Amount</label>
                  <p class="text-sm font-semibold text-gray-800 py-2">
                    {{ fmt(rowAmount(row)) }}
                  </p>
                </div>
                <button
                  v-if="items.length > 1"
                  class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors mt-4"
                  @click="removeItem(idx)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add Item button -->
          <button
            type="button"
            class="mt-2 w-full py-3 rounded-2xl border-2 border-dashed border-muted/40 text-sm text-muted font-semibold hover:border-primary/40 hover:text-primary transition-colors"
            @click="addItem"
          >+ Add Item</button>

          <p v-if="submitted && v.items" class="mt-1 text-xs text-red-500">
            At least one item with an item code is required
          </p>
        </div>

        <!-- ── Tax Template ── -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="tax_template">
            Tax Template
          </label>
          <div class="relative">
            <select
              id="tax_template"
              v-model="taxTemplate"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition appearance-none pr-9"
              @change="onTaxTemplateChange"
            >
              <option value="">None</option>
              <option v-for="t in quotationStore.taxTemplates" :key="t.name" :value="t.name">
                {{ t.title || t.name }}
              </option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>

        <!-- ── Tax preview rows ── -->
        <div v-if="taxRates.length" class="bg-white rounded-2xl border border-muted/20 px-4 py-3 space-y-1.5">
          <div v-for="(t, i) in taxRates" :key="i" class="flex justify-between text-sm text-gray-600">
            <span class="truncate pr-2">{{ t.description || t.account_head }} ({{ t.rate }}%)</span>
            <span class="shrink-0 text-gray-800">{{ defaultsStore.currency || 'AED' }} {{ fmt(netTotal * (t.rate / 100)) }}</span>
          </div>
        </div>

        <!-- ── Notes (collapsible) ── -->
        <div class="border border-muted/30 rounded-2xl overflow-hidden">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 bg-white text-left"
            @click="showNotes = !showNotes"
          >
            <span class="text-sm font-semibold text-gray-700">
              {{ showNotes ? 'Notes' : 'Add Notes' }}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-muted transition-transform duration-200"
              :class="showNotes ? 'rotate-180' : ''"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-if="showNotes" class="px-4 pb-4 pt-2 bg-white border-t border-muted/20">
            <label class="block text-xs font-semibold text-gray-600 mb-2">Terms &amp; Conditions</label>
            <TermsSelect v-model="terms" />
          </div>
        </div>

        <!-- ── Totals preview ── -->
        <div class="bg-white rounded-2xl border border-muted/20 px-4 py-3 space-y-2">
          <div class="flex justify-between text-sm text-gray-600">
            <span>Net Total</span>
            <span>{{ defaultsStore.currency || 'AED' }} {{ fmt(netTotal) }}</span>
          </div>
          <div v-if="taxTotal > 0" class="flex justify-between text-sm text-gray-600">
            <span>Tax</span>
            <span>{{ defaultsStore.currency || 'AED' }} {{ fmt(taxTotal) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
            <span>Grand Total</span>
            <span>{{ defaultsStore.currency || 'AED' }} {{ fmt(grandTotal) }}</span>
          </div>
        </div>

      </div>

      <!-- ── Sticky footer ──────────────────────────────────────────────────── -->
      <ActionFooter>
        <!-- Single save button — new mode saves as draft, edit mode saves changes -->
        <button
          type="button"
          class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
          :class="saving ? 'opacity-70 pointer-events-none' : ''"
          :disabled="saving"
          @click="handleSaveDraft"
        >
          <svg v-if="saving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Draft' }}
        </button>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotations'
import { useDefaultsStore } from '@/stores/defaults'
import { api } from '@/composables/useApi'
import { useFormatters } from '@/composables/useFormatters'
import ActionFooter from '@/components/shared/ActionFooter.vue'
import TermsSelect from '@/components/shared/TermsSelect.vue'
import AutocompleteInput from '@/components/shared/AutocompleteInput.vue'

const route          = useRoute()
const router         = useRouter()
const quotationStore = useQuotationStore()
const defaultsStore  = useDefaultsStore()
const { fmt } = useFormatters()

// ── Mode detection ────────────────────────────────────────────────────────────
const isEdit        = route.name === 'QuotationEdit'
const quotationName = isEdit ? route.params.name : null

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10)
}
function todayPlus30() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}
function newItemRow() {
  return {
    id: Math.random(),
    itemQuery: '',
    itemCode: '',
    itemName: '',
    qty: 1,
    rate: 0,
    uom: 'Nos',
    loading: false,
    itemResults: [],
  }
}

// ── Form state ────────────────────────────────────────────────────────────────
const customerQuery   = ref('')
const customerId      = ref('')
const customerLabel   = ref('')
const customerResults = ref([])

const transactionDate = ref(today())
const validTill       = ref(todayPlus30())

const items = ref([newItemRow()])

const taxTemplate = ref('')
const taxRows     = ref([])  // ALL rows from template — sent to server on save
const taxRates    = ref([])  // On Net Total rows only — used for client-side preview

const terms     = ref('')
const showNotes = ref(false)

// ── UI state ──────────────────────────────────────────────────────────────────
const saving      = ref(false)
const loadingEdit = ref(isEdit)
const saveError   = ref(null)
const submitted   = ref(false)

// ── Validation ────────────────────────────────────────────────────────────────
const v = computed(() => ({
  customer: !customerId.value,
  items:    items.value.length === 0 || items.value.some((r) => !r.itemCode),
}))
const isValid = computed(() => !Object.values(v.value).some(Boolean))

// ── Computed totals ───────────────────────────────────────────────────────────
const netTotal = computed(() =>
  items.value.reduce((s, r) => s + rowAmount(r), 0),
)
const taxTotal = computed(() =>
  taxRates.value.reduce((s, t) => s + netTotal.value * (t.rate / 100), 0),
)
const grandTotal = computed(() => netTotal.value + taxTotal.value)

function rowAmount(row) {
  return (row.qty || 0) * (row.rate || 0)
}

// ── Page title ────────────────────────────────────────────────────────────────
const pageTitle = computed(() => isEdit ? 'Edit Quotation' : 'New Quotation')

// ── Customer autocomplete ─────────────────────────────────────────────────────
let customerTimer = null

async function _doCustomerSearch(query) {
  try {
    const filters = [['disabled', '!=', 1]]
    if (query.trim()) filters.push(['customer_name', 'like', `%${query.trim()}%`])
    const res = await api.getList('Customer', {
      fields: ['name', 'customer_name'],
      filters,
      limit: 8,
      orderBy: 'customer_name asc',
    })
    customerResults.value = res?.data ?? res ?? []
  } catch {
    customerResults.value = []
  }
}

function onCustomerInput() {
  customerId.value    = ''
  customerLabel.value = ''
  clearTimeout(customerTimer)
  customerTimer = setTimeout(() => _doCustomerSearch(customerQuery.value), 280)
}

function onCustomerFocus() {
  // Show results immediately on focus (even with empty field)
  if (customerResults.value.length > 0) return
  _doCustomerSearch(customerQuery.value)
}

const normalizedCustomerResults = computed(() =>
  customerResults.value.map(c => ({
    id:       c.name,
    label:    c.customer_name,
    sublabel: c.customer_name !== c.name ? c.name : null,
  }))
)

function selectCustomer(item) {
  customerId.value      = item.id
  customerLabel.value   = item.label
  customerQuery.value   = item.label
  customerResults.value = []
}

function hideCustomerResultsDelayed() {
  setTimeout(() => { customerResults.value = [] }, 150)
}

// ── Item autocomplete ─────────────────────────────────────────────────────────
async function _doItemSearch(row, query) {
  try {
    const filters = [['disabled', '!=', 1]]
    if (query.trim()) filters.push(['item_name', 'like', `%${query.trim()}%`])
    const res = await api.getList('Item', {
      fields: ['item_code', 'item_name', 'stock_uom', 'standard_rate'],
      filters,
      limit: 8,
      orderBy: 'item_name asc',
    })
    row.itemResults = res?.data ?? res ?? []
  } catch {
    row.itemResults = []
  }
}

function onItemInput(row) {
  row.itemCode = ''
  row.itemName = ''
  if (row._itemTimer) clearTimeout(row._itemTimer)
  row._itemTimer = setTimeout(() => _doItemSearch(row, row.itemQuery), 280)
}

function onItemFocus(row) {
  // Show results immediately on focus (even with empty field)
  if (row.itemResults?.length > 0) return
  _doItemSearch(row, row.itemQuery)
}

async function selectItem(row, item) {
  row.itemCode    = item.item_code
  row.itemName    = item.item_name
  row.itemQuery   = item.item_name
  row.uom         = item.stock_uom || 'Nos'
  row.rate        = item.standard_rate || 0
  row.itemResults = []
  // Best-effort: try to get the customer-specific price from ERPNext
  await fetchItemRate(row)
}

function hideItemResultsDelayed(row) {
  setTimeout(() => { row.itemResults = [] }, 150)
}

function onQtyRateChange(row) {
  // Re-fetch rate when qty changes (price may vary by qty breaks)
  if (row.itemCode && customerId.value) {
    fetchItemRate(row)
  }
}

async function fetchItemRate(row) {
  if (!row.itemCode || !customerId.value || !defaultsStore.company) return
  row.loading = true
  try {
    const result = await api.call('erpnext.stock.get_item_details.get_item_details', {
      args: {
        item_code:           row.itemCode,
        qty:                 row.qty,
        company:             defaultsStore.company,
        price_list:          defaultsStore.sellingPriceList,
        currency:            defaultsStore.currency,
        customer:            customerId.value,
        transaction_date:    transactionDate.value,
        doctype:             'Quotation',
        name:                'new',
        conversion_rate:     1,
        price_list_currency: defaultsStore.currency,
        plc_conversion_rate: 1,
      },
    })
    if (result?.price_list_rate != null) row.rate = result.price_list_rate
  } catch {
    // Keep standard_rate — not all ERPNext configs expose this method
  } finally {
    row.loading = false
  }
}

// ── Item row management ───────────────────────────────────────────────────────
function addItem()        { items.value.push(newItemRow()) }
function removeItem(idx)  { items.value.splice(idx, 1) }

// ── Tax template ──────────────────────────────────────────────────────────────
async function onTaxTemplateChange() {
  if (!taxTemplate.value) {
    taxRows.value  = []
    taxRates.value = []
    return
  }
  try {
    const result = await api.getDoc('Sales Taxes and Charges Template', taxTemplate.value)
    const tmpl   = result?.data ?? result     // unwrap Frappe's { data: {...} } envelope
    taxRows.value  = tmpl.taxes ?? []                                         // all rows → saved to server
    taxRates.value = taxRows.value.filter((t) => t.charge_type === 'On Net Total')  // preview only
  } catch {
    taxRows.value  = []
    taxRates.value = []
  }
}

// ── Build Frappe document ─────────────────────────────────────────────────────
function buildDoc() {
  return {
    ...(isEdit ? { name: quotationName } : {}),
    doctype:         'Quotation',
    quotation_to:    'Customer',
    party_name:      customerId.value,
    customer_name:   customerLabel.value,
    transaction_date: transactionDate.value,
    valid_till:       validTill.value,
    order_type:      'Sales',
    items: items.value.map((r) => ({
      item_code: r.itemCode,
      item_name: r.itemName,
      qty:       r.qty,
      rate:      r.rate,
      uom:       r.uom,
    })),
    ...(taxTemplate.value ? { taxes_and_charges: taxTemplate.value } : {}),
    // Include tax rows explicitly so ERPNext persists and calculates them via REST
    ...(taxRows.value.length ? {
      taxes: taxRows.value.map((t) => ({
        charge_type:  t.charge_type,
        account_head: t.account_head,
        rate:         t.rate,
        description:  t.description,
        cost_center:  t.cost_center ?? '',
        row_id:       t.row_id ?? '',
      })),
    } : {}),
    ...(terms.value.trim() ? { terms: terms.value.trim() } : {}),
  }
}

// ── Save handlers ─────────────────────────────────────────────────────────────
async function handleSaveDraft() {
  submitted.value = true
  if (!isValid.value) return

  saving.value    = true
  saveError.value = null
  try {
    const saved = await quotationStore.saveQuotation(buildDoc())
    router.push({ name: 'QuotationDetail', params: { name: saved.name ?? quotationName } })
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to save quotation'
  } finally {
    saving.value = false
  }
}

// ── onMounted ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Load defaults and tax templates in parallel
  await Promise.allSettled([
    defaultsStore.fetchDefaults(),
    quotationStore.fetchTaxTemplates(),
  ])

  if (!isEdit) return

  // Pre-fill form from existing quotation
  try {
    const doc = await quotationStore.fetchQuotationDetail(quotationName)

    customerId.value    = doc.party_name      ?? ''
    customerLabel.value = doc.customer_name   ?? ''
    customerQuery.value = doc.customer_name   ?? ''
    transactionDate.value = doc.transaction_date ?? today()
    validTill.value       = doc.valid_till       ?? todayPlus30()
    taxTemplate.value = doc.taxes_and_charges ?? ''
    terms.value       = doc.terms ?? ''

    if (doc.terms) showNotes.value = true

    items.value = (doc.items ?? []).map((r) => ({
      id:          Math.random(),
      itemQuery:   r.item_name  ?? r.item_code ?? '',
      itemCode:    r.item_code  ?? '',
      itemName:    r.item_name  ?? '',
      qty:         r.qty        ?? 1,
      rate:        r.rate       ?? 0,
      uom:         r.uom        ?? 'Nos',
      loading:     false,
      itemResults: [],
    }))

    if (taxTemplate.value) {
      await onTaxTemplateChange()
    }
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to load quotation data'
  } finally {
    loadingEdit.value = false
  }
})

</script>
