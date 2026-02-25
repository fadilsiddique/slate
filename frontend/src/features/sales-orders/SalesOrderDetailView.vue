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
        <h1 class="text-lg font-bold text-gray-900">Sales Order</h1>
      </header>
      <ErrorState title="Couldn't load order" :message="error" @retry="loadOrder" />
    </template>

    <!-- ── Loaded ──────────────────────────────────────────────────────────── -->
    <template v-else-if="so">

      <!-- Absolute top nav -->
      <DetailTopNav @back="router.back()">
        <div class="flex items-center gap-2">
          <ShareButton
            doctype="Sales Order"
            :doc-name="orderName"
            :customer-name="so.customer_name || ''"
            :grand-total="so.grand_total || 0"
            :currency="currency"
            @error="shareError = $event"
          />
          <button
            v-if="so.docstatus === 0"
            class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
            @click="router.push({ name: 'OrderEdit', params: { name: orderName } })"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </DetailTopNav>

      <!-- Content -->
      <div class="pt-16 px-4 pb-36 space-y-4">

        <!-- Header card -->
        <div class="bg-white rounded-2xl px-5 py-4 border border-muted/20 shadow-sm">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-[11px] font-mono text-muted/80">{{ so.name }}</span>
            <StatusBadge :label="statusLabel(so)" :color-class="statusBadgeClass(so)" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight mb-1">
            {{ so.customer_name || so.customer || '—' }}
          </h1>
          <p class="text-xs text-muted">
            {{ fmtDate(so.transaction_date) }}
            <span v-if="so.delivery_date"> · Deliver by {{ fmtDate(so.delivery_date) }}</span>
          </p>
        </div>

        <!-- Action error banner -->
        <div
          v-if="actionError || shareError"
          class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {{ actionError || shareError }}
        </div>

        <!-- Progress card (only for submitted orders) -->
        <SectionCard v-if="so.docstatus === 1" title="Progress">
          <div class="px-4 py-3 space-y-3">
            <!-- Delivery -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Delivery</span>
                <span class="text-xs font-semibold text-gray-700">
                  {{ so.per_delivered ?? 0 }}%
                  <span class="font-normal text-muted ml-1">{{ so.delivery_status }}</span>
                </span>
              </div>
              <div class="h-2 bg-muted/20 rounded-full overflow-hidden">
                <div
                  class="h-2 bg-primary rounded-full transition-all"
                  :style="{ width: `${so.per_delivered ?? 0}%` }"
                />
              </div>
            </div>
            <!-- Billing -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">Billing</span>
                <span class="text-xs font-semibold text-gray-700">
                  {{ so.per_billed ?? 0 }}%
                  <span class="font-normal text-muted ml-1">{{ so.billing_status }}</span>
                </span>
              </div>
              <div class="h-2 bg-muted/20 rounded-full overflow-hidden">
                <div
                  class="h-2 bg-green-500 rounded-full transition-all"
                  :style="{ width: `${so.per_billed ?? 0}%` }"
                />
              </div>
            </div>
          </div>
        </SectionCard>

        <!-- Items card -->
        <SectionCard title="Items">
          <div class="divide-y divide-muted/10">
            <div
              v-for="item in so.items ?? []"
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
            <div v-if="!so.items?.length" class="px-4 py-4 text-sm text-muted text-center">
              No items
            </div>
          </div>
        </SectionCard>

        <!-- Summary card -->
        <SectionCard title="Summary">
          <div class="px-4 py-3 space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Net Total</span>
              <span>{{ currency }} {{ fmt(so.net_total ?? so.total) }}</span>
            </div>
            <template v-for="tax in so.taxes ?? []" :key="tax.name ?? tax.idx">
              <div class="flex justify-between text-sm text-gray-600">
                <span class="truncate pr-2">{{ tax.description || tax.account_head }} ({{ tax.rate }}%)</span>
                <span class="shrink-0">{{ currency }} {{ fmt(tax.tax_amount) }}</span>
              </div>
            </template>
            <div v-if="so.discount_amount > 0" class="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>− {{ currency }} {{ fmt(so.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
              <span>Grand Total</span>
              <span>{{ currency }} {{ fmt(so.grand_total) }}</span>
            </div>
          </div>
        </SectionCard>

        <!-- PO Info card -->
        <SectionCard v-if="so.po_no" title="Purchase Order">
          <div class="px-4 py-3 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">PO Number</span>
              <span class="font-medium text-gray-800">{{ so.po_no }}</span>
            </div>
            <div v-if="so.po_date" class="flex justify-between text-sm">
              <span class="text-gray-500">PO Date</span>
              <span class="text-gray-700">{{ fmtDate(so.po_date) }}</span>
            </div>
          </div>
        </SectionCard>

        <!-- Terms card -->
        <SectionCard v-if="so.terms" title="Terms &amp; Conditions">
          <div class="px-4 py-3">
            <div class="terms-html text-sm text-gray-700" v-html="so.terms" />
          </div>
        </SectionCard>

      </div>

      <!-- ── Action footer ─────────────────────────────────────────────────── -->
      <ActionFooter v-if="showActions">
        <!-- Draft: Edit + Submit -->
        <div v-if="so.docstatus === 0" class="flex gap-3">
          <button
            class="flex-1 border border-muted/40 text-gray-700 rounded-xl py-3 font-semibold text-sm active:scale-[.97] transition-transform"
            @click="router.push({ name: 'OrderEdit', params: { name: orderName } })"
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

        <!-- Submitted + active: Create DN + Create SI -->
        <div v-else-if="so.docstatus === 1 && so.status !== 'Completed' && so.status !== 'Cancelled'" class="flex gap-3">
          <button
            class="flex-1 border border-primary text-primary rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[.97] transition-transform"
            :class="actioning ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleCreateDN"
          >
            <svg v-if="actioning && actionTarget === 'dn'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'dn' ? 'Creating…' : 'Delivery Note' }}
          </button>
          <button
            class="flex-1 bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[.97] transition-transform"
            :class="actioning ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleCreateSI"
          >
            <svg v-if="actioning && actionTarget === 'si'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'si' ? 'Creating…' : 'Sales Invoice' }}
          </button>
        </div>

        <!-- Completed -->
        <div v-else-if="so.docstatus === 1 && so.status === 'Completed'" class="text-center">
          <p class="text-sm text-green-700 font-semibold">Order Completed</p>
          <p class="text-xs text-muted mt-0.5">Fully delivered and billed</p>
        </div>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/orders'
import { useDeliveryNoteStore } from '@/stores/deliveryNotes'
import { useInvoiceStore } from '@/stores/invoices'
import ShareButton from '@/components/shared/ShareButton.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import ActionFooter from '@/components/shared/ActionFooter.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import DetailTopNav from '@/components/shared/DetailTopNav.vue'
import { useFormatters } from '@/composables/useFormatters'

const route      = useRoute()
const router     = useRouter()
const orderStore   = useOrderStore()
const dnStore      = useDeliveryNoteStore()
const invoiceStore = useInvoiceStore()

const orderName = route.params.name
const { fmt, fmtDate } = useFormatters()

// ── State ─────────────────────────────────────────────────────────────────────
const so          = ref(null)
const loading     = ref(true)
const error       = ref(null)
const actioning   = ref(false)
const actionError = ref(null)
const actionTarget = ref('')  // 'dn' | 'si' | 'submit'
const shareError  = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const currency = computed(() => so.value?.currency || 'AED')

const showActions = computed(() => {
  const o = so.value
  if (!o) return false
  return o.docstatus === 0 || o.docstatus === 1
})

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadOrder() {
  loading.value = true
  error.value   = null
  try {
    so.value = await orderStore.fetchOrderDetail(orderName)
  } catch (e) {
    error.value = e?.message ?? 'Failed to load order'
  } finally {
    loading.value = false
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  actioning.value    = true
  actionTarget.value = 'submit'
  actionError.value  = null
  try {
    await orderStore.submitOrder(orderName, so.value)
    so.value = await orderStore.fetchOrderDetail(orderName)
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to submit order'
  } finally {
    actioning.value    = false
    actionTarget.value = ''
  }
}

async function handleCreateDN() {
  actioning.value    = true
  actionTarget.value = 'dn'
  actionError.value  = null
  try {
    const dnDoc = await orderStore.createDeliveryNote(orderName)
    dnStore.setPrefill(dnDoc)
    router.push({ name: 'DeliveryNoteNew' })
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to prepare Delivery Note'
    actioning.value    = false
    actionTarget.value = ''
  }
}

async function handleCreateSI() {
  actioning.value    = true
  actionTarget.value = 'si'
  actionError.value  = null
  try {
    const siDoc = await orderStore.createSalesInvoice(orderName)
    invoiceStore.setPrefill(siDoc)
    router.push({ name: 'InvoiceNew' })
  } catch (e) {
    actionError.value  = e?.message ?? 'Failed to create Sales Invoice'
    actioning.value    = false
    actionTarget.value = ''
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusLabel(o) {
  if (o.docstatus === 2) return 'Cancelled'
  if (o.docstatus === 0) return 'Draft'
  return o.status || 'To Deliver and Bill'
}

function statusBadgeClass(o) {
  if (o.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (o.docstatus === 0) return 'bg-gray-100 text-gray-600'
  const map = {
    'To Deliver and Bill': 'bg-primary/10 text-primary',
    'To Bill':             'bg-amber-50 text-amber-700',
    'To Deliver':          'bg-blue-50 text-blue-700',
    Completed:             'bg-green-50 text-green-700',
  }
  return map[o.status] ?? 'bg-gray-100 text-gray-600'
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(loadOrder)
</script>

<style scoped>
.terms-html :deep(h1) { font-size: 1.05rem; font-weight: 700; margin: 0.625rem 0 0.25rem; }
.terms-html :deep(h2) { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
.terms-html :deep(h3),.terms-html :deep(h4) { font-size: 0.875rem; font-weight: 600; margin: 0.4rem 0 0.2rem; }
.terms-html :deep(p)  { margin: 0.3rem 0; line-height: 1.6; }
.terms-html :deep(ul) { list-style-type: disc; padding-left: 1.25rem; margin: 0.3rem 0; }
.terms-html :deep(ol) { list-style-type: decimal; padding-left: 1.25rem; margin: 0.3rem 0; }
.terms-html :deep(li) { margin: 0.2rem 0; }
.terms-html :deep(strong) { font-weight: 600; }
.terms-html :deep(em) { font-style: italic; }
.terms-html :deep(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 0.5rem 0; }
</style>
