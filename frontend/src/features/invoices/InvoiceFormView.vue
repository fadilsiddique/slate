<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading ──────────────────────────────────────────────────────────── -->
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
        <h1 class="text-lg font-bold text-gray-900">{{ isEdit ? 'Edit Invoice' : 'New Invoice' }}</h1>
      </header>

      <!-- ── Return banner ─────────────────────────────────────────────────── -->
      <div
        v-if="isReturnInvoice"
        class="mx-4 mt-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700 font-medium"
      >
        Credit Note — Return for {{ returnAgainst }}
      </div>

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

          <!-- Read-only (prefill from SO/DN/credit note) -->
          <div v-if="customerReadOnly" class="px-4 py-3 bg-white rounded-xl border border-muted/40 text-sm text-gray-800">
            {{ customerLabel }}
          </div>

          <!-- Searchable (standalone / edit) -->
          <AutocompleteInput
            v-else
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

        <!-- ── Posting Date ── -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="posting_date">
            Posting Date <span class="text-red-400">*</span>
          </label>
          <input
            id="posting_date"
            v-model="postingDate"
            type="date"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
          />
        </div>

        <!-- ── Due Date ── -->
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1.5" for="due_date">
            Due Date
          </label>
          <input
            id="due_date"
            v-model="dueDate"
            type="date"
            class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition"
          />
        </div>

        <!-- ── Payment Terms Template ── -->
        <div v-if="paymentTermsOptions.length">
          <label class="block text-xs font-semibold text-gray-600 mb-1.5">
            Payment Terms
          </label>
          <div class="relative">
            <select
              v-model="paymentTerms"
              class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition appearance-none pr-9"
            >
              <option value="">None</option>
              <option v-for="pt in paymentTermsOptions" :key="pt" :value="pt">{{ pt }}</option>
            </select>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
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
              :class="submitted && (!row.itemCode || !(row.qty > 0)) ? 'border-red-300' : ''"
            >

              <!-- Prefill mode: read-only item info -->
              <div v-if="customerReadOnly">
                <p class="text-sm font-medium text-gray-800 leading-tight">{{ row.itemName || row.itemCode }}</p>
                <p class="text-[11px] text-muted mt-0.5">{{ row.itemCode }}</p>
              </div>

              <!-- Standalone mode: item search -->
              <div v-else class="relative">
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

              <!-- Qty + Rate + Amount row -->
              <div class="flex items-end gap-2">

                <!-- Qty -->
                <div class="w-24 shrink-0">
                  <label class="block text-[10px] text-muted mb-1">Qty</label>
                  <input
                    v-model.number="row.qty"
                    type="number"
                    min="0.001"
                    step="1"
                    placeholder="1"
                    class="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition text-right"
                  />
                </div>

                <!-- Rate -->
                <div class="flex-1 min-w-0">
                  <label class="block text-[10px] text-muted mb-1">Rate</label>
                  <input
                    v-model.number="row.rate"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    :readonly="row.loading"
                    class="w-full px-3 py-2 text-sm bg-surface rounded-xl border border-muted/30 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition text-right"
                  />
                </div>

                <!-- Amount display -->
                <div class="shrink-0 text-right pb-0.5">
                  <label class="block text-[10px] text-muted mb-1">Amount</label>
                  <p class="text-sm font-semibold text-gray-800 py-2 pr-1">{{ fmt(row.qty * row.rate) }}</p>
                </div>

                <!-- Remove button (standalone, more than 1 item) -->
                <button
                  v-if="!customerReadOnly && items.length > 1"
                  class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors mb-0.5"
                  @click="removeItem(idx)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

          <!-- Add Item button (standalone only) -->
          <button
            v-if="!customerReadOnly"
            type="button"
            class="mt-2 w-full py-3 rounded-2xl border-2 border-dashed border-muted/40 text-sm text-muted font-semibold hover:border-primary/40 hover:text-primary transition-colors"
            @click="addItem"
          >+ Add Item</button>

          <p v-if="submitted && v.items" class="mt-1 text-xs text-red-500">
            Each item requires a code and quantity greater than 0
          </p>
        </div>

        <!-- ── Totals preview ── -->
        <div
          v-if="netTotal > 0"
          class="bg-white rounded-2xl border border-muted/20 px-4 py-3 space-y-2"
        >
          <div class="flex justify-between text-sm text-gray-600">
            <span>Net Total</span>
            <span>{{ currency }} {{ fmtShort(netTotal) }}</span>
          </div>
          <div v-for="(t, i) in taxRates" :key="i" class="flex justify-between text-sm text-gray-600">
            <span class="truncate pr-2">{{ t.description || t.account_head }} ({{ t.rate }}%)</span>
            <span class="shrink-0">{{ currency }} {{ fmtShort(netTotal * (t.rate / 100)) }}</span>
          </div>
          <div v-if="taxTotal > 0" class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
            <span>Grand Total</span>
            <span>{{ currency }} {{ fmtShort(grandTotal) }}</span>
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
            <label class="block text-xs font-semibold text-gray-600 mb-1">Terms &amp; Conditions</label>
            <textarea
              v-model="terms"
              rows="4"
              placeholder="Terms and conditions…"
              class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition resize-none"
            />
          </div>
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
          {{ saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Save Draft') }}
        </button>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoices'
import { useDefaultsStore } from '@/stores/defaults'
import { api } from '@/composables/useApi'
import { useFormatters } from '@/composables/useFormatters'
import ActionFooter from '@/components/shared/ActionFooter.vue'
import AutocompleteInput from '@/components/shared/AutocompleteInput.vue'

const route  = useRoute()
const router = useRouter()
const invoiceStore  = useInvoiceStore()
const defaultsStore = useDefaultsStore()
const { fmt, fmtShort } = useFormatters()

// ── Mode detection ────────────────────────────────────────────────────────────
const isEdit      = route.name === 'InvoiceEdit'
const invoiceName = isEdit ? route.params.name : null

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10)
}

function newItemRow() {
  return {
    id:             Math.random(),
    itemQuery:      '',
    itemCode:       '',
    itemName:       '',
    qty:            1,
    rate:           0,
    uom:            'Nos',
    income_account: '',
    cost_center:    '',
    sales_order:    '',
    so_detail:      '',
    delivery_note:  '',
    dn_detail:      '',
    loading:        false,
    itemResults:    [],
  }
}

// ── Form state ────────────────────────────────────────────────────────────────
const customerReadOnly = ref(false)
const customerQuery    = ref('')
const customerId       = ref('')
const customerLabel    = ref('')
const customerResults  = ref([])

const postingDate         = ref(today())
const dueDate             = ref('')
const paymentTerms        = ref('')
const paymentTermsOptions = ref([])

const isReturnInvoice = ref(false)
const returnAgainst   = ref('')

const items = ref([newItemRow()])

const taxTemplate = ref('')
const taxRows     = ref([])   // passed through from prefill — sent on save
const taxRates    = ref([])   // On Net Total only — for totals preview

const terms     = ref('')
const showNotes = ref(false)

// ── UI state ──────────────────────────────────────────────────────────────────
const loadingInit = ref(true)
const saving      = ref(false)
const saveError   = ref(null)
const submitted   = ref(false)

// ── Validation ────────────────────────────────────────────────────────────────
const v = computed(() => ({
  customer: !customerId.value,
  items:    items.value.length === 0 ||
            items.value.some((r) => !r.itemCode || !(r.qty > 0)),
}))
const isValid = computed(() => !Object.values(v.value).some(Boolean))

// ── Computed totals ───────────────────────────────────────────────────────────
const currency   = computed(() => defaultsStore.currency || 'AED')
const netTotal   = computed(() => items.value.reduce((s, r) => s + (r.qty || 0) * (r.rate || 0), 0))
const taxTotal   = computed(() => taxRates.value.reduce((s, t) => s + netTotal.value * (t.rate / 100), 0))
const grandTotal = computed(() => netTotal.value + taxTotal.value)

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
  if (customerResults.value.length > 0) return
  _doCustomerSearch(customerQuery.value)
}

const normalizedCustomerResults = computed(() =>
  customerResults.value.map((c) => ({
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
  await fetchItemRate(row)
}

function hideItemResultsDelayed(row) {
  setTimeout(() => { row.itemResults = [] }, 150)
}

// ── Item row management ───────────────────────────────────────────────────────
function addItem()        { items.value.push(newItemRow()) }
function removeItem(idx)  { items.value.splice(idx, 1) }

// ── Item rate fetch (best-effort) ─────────────────────────────────────────────
async function fetchItemRate(row) {
  if (!row.itemCode || !customerId.value) return
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
        transaction_date:    postingDate.value,
        doctype:             'Sales Invoice',
        name:                'new',
        conversion_rate:     1,
        price_list_currency: defaultsStore.currency,
        plc_conversion_rate: 1,
      },
    })
    if (result?.price_list_rate) row.rate = result.price_list_rate
  } catch { /* keep standard_rate */ } finally {
    row.loading = false
  }
}

// ── Build Frappe document ─────────────────────────────────────────────────────
function buildDoc() {
  return {
    ...(isEdit ? { name: invoiceName } : {}),
    doctype:       'Sales Invoice',
    customer:      customerId.value,
    customer_name: customerLabel.value,
    posting_date:  postingDate.value,
    ...(dueDate.value      ? { due_date:                dueDate.value }      : {}),
    ...(paymentTerms.value ? { payment_terms_template:  paymentTerms.value } : {}),
    ...(isReturnInvoice.value ? { is_return: 1, return_against: returnAgainst.value } : {}),
    items: items.value.map((r) => ({
      item_code:  r.itemCode,
      item_name:  r.itemName,
      qty:        r.qty,
      rate:       r.rate,
      uom:        r.uom,
      ...(r.income_account ? { income_account: r.income_account } : {}),
      ...(r.cost_center    ? { cost_center:    r.cost_center }    : {}),
      ...(r.sales_order    ? { sales_order:    r.sales_order }    : {}),
      ...(r.so_detail      ? { so_detail:      r.so_detail }      : {}),
      ...(r.delivery_note  ? { delivery_note:  r.delivery_note }  : {}),
      ...(r.dn_detail      ? { dn_detail:      r.dn_detail }      : {}),
    })),
    ...(taxTemplate.value ? { taxes_and_charges: taxTemplate.value } : {}),
    ...(taxRows.value.length ? {
      taxes: taxRows.value.map((t) => ({
        charge_type:  t.charge_type,
        account_head: t.account_head,
        rate:         t.rate,
        description:  t.description,
        cost_center:  t.cost_center ?? '',
      })),
    } : {}),
    ...(terms.value.trim() ? { terms: terms.value.trim() } : {}),
  }
}

// ── Save handler ──────────────────────────────────────────────────────────────
async function handleSave() {
  submitted.value = true
  if (!isValid.value) return

  saving.value    = true
  saveError.value = null
  try {
    const saved = await invoiceStore.saveInvoice(buildDoc())
    router.push({ name: 'InvoiceDetail', params: { name: saved.name ?? invoiceName } })
  } catch (e) {
    saveError.value = e?.message ?? 'Failed to save invoice'
  } finally {
    saving.value = false
  }
}

// ── onMounted ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await defaultsStore.fetchDefaults()

  // Fetch payment terms options (best-effort)
  try {
    const res = await api.getList('Payment Terms Template', {
      fields: ['name'],
      limit: 50,
      orderBy: 'name asc',
    })
    paymentTermsOptions.value = (res?.data ?? res ?? []).map((r) => r.name)
  } catch {
    paymentTermsOptions.value = []
  }

  // Check for prefill (from SO, DN, or Credit Note)
  const prefill = invoiceStore.consumePrefill()
  if (prefill) {
    customerReadOnly.value = !!prefill.customer
    customerId.value       = prefill.customer          ?? ''
    customerLabel.value    = prefill.customer_name     ?? ''
    customerQuery.value    = prefill.customer_name     ?? ''
    postingDate.value      = today()
    dueDate.value          = prefill.due_date          ?? ''
    paymentTerms.value     = prefill.payment_terms_template ?? ''
    taxTemplate.value      = prefill.taxes_and_charges ?? ''
    taxRows.value          = prefill.taxes             ?? []
    taxRates.value         = taxRows.value.filter((t) => t.charge_type === 'On Net Total')
    terms.value            = prefill.terms             ?? ''
    isReturnInvoice.value  = !!prefill.is_return
    returnAgainst.value    = prefill.return_against    ?? ''

    if (prefill.items?.length) {
      items.value = prefill.items.map((r) => ({
        id:             Math.random(),
        itemCode:       r.item_code     ?? '',
        itemName:       r.item_name     ?? r.item_code ?? '',
        itemQuery:      r.item_name     ?? '',
        qty:            r.qty           ?? 1,
        rate:           r.rate          ?? 0,
        uom:            r.uom           ?? 'Nos',
        income_account: r.income_account ?? '',
        cost_center:    r.cost_center    ?? '',
        sales_order:    r.sales_order    ?? '',
        so_detail:      r.so_detail      ?? '',
        delivery_note:  r.delivery_note  ?? '',
        dn_detail:      r.dn_detail      ?? '',
        loading:        false,
        itemResults:    [],
      }))
    }

    loadingInit.value = false
    return
  }

  // Edit mode: load existing SI
  if (isEdit) {
    try {
      const doc = await invoiceStore.fetchInvoice(invoiceName)
      customerId.value    = doc.customer          ?? ''
      customerLabel.value = doc.customer_name     ?? ''
      customerQuery.value = doc.customer_name     ?? ''
      postingDate.value   = doc.posting_date      ?? today()
      dueDate.value       = doc.due_date          ?? ''
      paymentTerms.value  = doc.payment_terms_template ?? ''
      taxTemplate.value   = doc.taxes_and_charges ?? ''
      taxRows.value       = doc.taxes             ?? []
      taxRates.value      = taxRows.value.filter((t) => t.charge_type === 'On Net Total')
      terms.value         = doc.terms             ?? ''
      isReturnInvoice.value = !!doc.is_return
      returnAgainst.value   = doc.return_against  ?? ''

      items.value = (doc.items ?? []).map((r) => ({
        id:             Math.random(),
        itemCode:       r.item_code     ?? '',
        itemName:       r.item_name     ?? r.item_code ?? '',
        itemQuery:      r.item_name     ?? '',
        qty:            r.qty           ?? 1,
        rate:           r.rate          ?? 0,
        uom:            r.uom           ?? 'Nos',
        income_account: r.income_account ?? '',
        cost_center:    r.cost_center    ?? '',
        sales_order:    r.sales_order    ?? '',
        so_detail:      r.so_detail      ?? '',
        delivery_note:  r.delivery_note  ?? '',
        dn_detail:      r.dn_detail      ?? '',
        loading:        false,
        itemResults:    [],
      }))
    } catch (e) {
      saveError.value = e?.message ?? 'Failed to load invoice'
    }
    loadingInit.value = false
    return
  }

  // Standalone new SI — empty form
  loadingInit.value = false
})
</script>
