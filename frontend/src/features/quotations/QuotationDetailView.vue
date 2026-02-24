<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading skeleton ────────────────────────────────────────────────── -->
    <template v-if="loading">
      <div class="absolute top-0 left-0 right-0 h-14 bg-white/80 border-b border-muted/20 z-10" />
      <div class="pt-16 px-4 pb-4 space-y-4">
        <div class="bg-white rounded-2xl p-5 border border-muted/20">
          <div class="w-32 h-4 bg-muted/20 rounded animate-pulse mb-3" />
          <div class="w-48 h-6 bg-muted/20 rounded animate-pulse mb-2" />
          <div class="w-24 h-4 bg-muted/20 rounded animate-pulse" />
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
        <h1 class="text-lg font-bold text-gray-900">Quotation</h1>
      </header>
      <div class="flex flex-col items-center justify-center py-20 text-center px-6">
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="text-gray-700 font-semibold">Couldn't load quotation</p>
        <p class="text-red-400 text-xs mt-1 break-all">{{ error }}</p>
        <button
          class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
          @click="loadQuotation"
        >Try again</button>
      </div>
    </template>

    <!-- ── Loaded ──────────────────────────────────────────────────────────── -->
    <template v-else-if="quotation">

      <!-- Absolute top nav -->
      <div class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-muted/20">
        <button
          class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
          @click="router.back()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- Right side: share + edit (if draft) -->
        <div class="flex items-center gap-2">
          <ShareButton
            doctype="Quotation"
            :doc-name="quotationName"
            :customer-name="quotation.customer_name || quotation.party_name || ''"
            :grand-total="quotation.grand_total || 0"
            :currency="currency"
            @error="shareError = $event"
          />
          <button
            v-if="quotation.docstatus === 0"
            class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
            @click="router.push({ name: 'QuotationEdit', params: { name: quotationName } })"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="pt-16 px-4 pb-36 py-4 space-y-4">

        <!-- Header card -->
        <div class="bg-white rounded-2xl px-5 py-4 border border-muted/20 shadow-sm">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-[11px] font-mono text-muted/80">{{ quotation.name }}</span>
            <span
              class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              :class="statusBadgeClass(quotation)"
            >{{ statusLabel(quotation) }}</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight mb-1">
            {{ quotation.customer_name || quotation.party_name || '—' }}
          </h1>
          <p class="text-xs text-muted">
            {{ fmtDate(quotation.transaction_date) }}
            <span v-if="quotation.valid_till"> · Valid till {{ fmtDate(quotation.valid_till) }}</span>
          </p>
        </div>

        <!-- Action / share error banner -->
        <div
          v-if="actionError || shareError"
          class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {{ actionError || shareError }}
        </div>

        <!-- Items card -->
        <div class="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-muted/20">
            <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Items</p>
          </div>
          <div class="divide-y divide-muted/10">
            <div
              v-for="item in quotation.items ?? []"
              :key="item.name ?? item.idx"
              class="px-4 py-3 flex items-start justify-between gap-2"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 leading-tight">{{ item.item_name || item.item_code }}</p>
                <p class="text-[11px] text-muted mt-0.5">{{ item.item_code }}</p>
                <p class="text-[11px] text-muted">{{ fmt(item.qty) }} {{ item.uom || 'Nos' }} × {{ fmt(item.rate) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold text-gray-800">{{ fmt(item.amount) }}</p>
              </div>
            </div>
            <div v-if="!quotation.items?.length" class="px-4 py-4 text-sm text-muted text-center">
              No items
            </div>
          </div>
        </div>

        <!-- Summary card -->
        <div class="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-muted/20">
            <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Summary</p>
          </div>
          <div class="px-4 py-3 space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Net Total</span>
              <span>{{ currency }} {{ fmt(quotation.net_total ?? quotation.total) }}</span>
            </div>
            <template v-for="tax in quotation.taxes ?? []" :key="tax.name ?? tax.idx">
              <div class="flex justify-between text-sm text-gray-600">
                <span class="truncate pr-2">{{ tax.description || tax.account_head }} ({{ tax.rate }}%)</span>
                <span class="shrink-0">{{ currency }} {{ fmt(tax.tax_amount) }}</span>
              </div>
            </template>
            <div v-if="quotation.discount_amount > 0" class="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>− {{ currency }} {{ fmt(quotation.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
              <span>Grand Total</span>
              <span>{{ currency }} {{ fmt(quotation.grand_total) }}</span>
            </div>
          </div>
        </div>

        <!-- Terms card -->
        <div
          v-if="quotation.terms"
          class="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-muted/20">
            <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Terms &amp; Conditions</p>
          </div>
          <div class="px-4 py-3">
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ quotation.terms }}</p>
          </div>
        </div>

      </div>

      <!-- ── Action footer ─────────────────────────────────────────────────── -->
      <div
        v-if="showActions"
        class="fixed bottom-16 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t border-muted/20 px-4 py-3 shadow-lg"
        style="max-width: 480px; margin-inline: auto;"
      >
        <!-- Draft: Edit + Submit -->
        <div v-if="quotation.docstatus === 0" class="flex gap-3">
          <button
            class="flex-1 border border-muted/40 text-gray-700 rounded-xl py-3 font-semibold text-sm active:scale-[.97] transition-transform"
            @click="router.push({ name: 'QuotationEdit', params: { name: quotationName } })"
          >Edit</button>
          <button
            class="flex-1 bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleSubmit"
          >
            <svg v-if="actioning" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning ? 'Submitting…' : 'Submit' }}
          </button>
        </div>

        <!-- Submitted + not Ordered: Create Sales Order -->
        <div v-else-if="quotation.docstatus === 1 && quotation.status !== 'Ordered'">
          <button
            class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleCreateSO"
          >
            <svg v-if="actioning" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning ? 'Creating…' : 'Create Sales Order' }}
          </button>
        </div>

        <!-- Ordered: info text -->
        <div v-else-if="quotation.docstatus === 1 && quotation.status === 'Ordered'" class="text-center">
          <p class="text-sm text-green-700 font-semibold">✓ Sales Order created</p>
          <p class="text-xs text-muted mt-0.5">This quotation has been converted to a Sales Order</p>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuotationStore } from '@/stores/quotations'
import { useOrderStore } from '@/stores/orders'
import ShareButton from '@/components/shared/ShareButton.vue'

const route          = useRoute()
const router         = useRouter()
const quotationStore = useQuotationStore()
const orderStore     = useOrderStore()

const quotationName = route.params.name

// ── State ─────────────────────────────────────────────────────────────────────
const quotation   = ref(null)
const loading     = ref(true)
const error       = ref(null)
const actioning   = ref(false)
const actionError = ref(null)
const shareError  = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const currency = computed(() => quotation.value?.currency || 'AED')

const showActions = computed(() => {
  const q = quotation.value
  if (!q) return false
  return q.docstatus === 0 || q.docstatus === 1
})

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadQuotation() {
  loading.value = true
  error.value   = null
  try {
    quotation.value = await quotationStore.fetchQuotationDetail(quotationName)
  } catch (e) {
    error.value = e?.message ?? 'Failed to load quotation'
  } finally {
    loading.value = false
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  actioning.value   = true
  actionError.value = null
  try {
    await quotationStore.submitQuotation(quotationName, quotation.value)
    quotation.value = await quotationStore.fetchQuotationDetail(quotationName)
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to submit quotation'
  } finally {
    actioning.value = false
  }
}

async function handleCreateSO() {
  actioning.value   = true
  actionError.value = null
  try {
    const soDoc = await quotationStore.createSalesOrder(quotationName)
    orderStore.setPrefill(soDoc)
    router.push({ name: 'OrderNew' })
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to prepare Sales Order'
    actioning.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const _fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function fmt(n)     { return _fmt.format(n ?? 0) }
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(loadQuotation)
</script>
