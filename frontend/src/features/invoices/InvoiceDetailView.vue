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
        <h1 class="text-lg font-bold text-gray-900">Invoice</h1>
      </header>
      <ErrorState title="Couldn't load invoice" :message="error" @retry="loadInvoice" />
    </template>

    <!-- ── Loaded ──────────────────────────────────────────────────────────── -->
    <template v-else-if="si">

      <!-- Absolute top nav -->
      <DetailTopNav @back="router.back()">
        <div class="flex items-center gap-2">
          <!-- Share / print button -->
          <ShareButton
            doctype="Sales Invoice"
            :doc-name="invoiceName"
            :customer-name="si.customer_name || si.customer || ''"
            :grand-total="si.grand_total || 0"
            :currency="currency"
            @error="shareError = $event"
          />
          <!-- Edit pencil (draft only) -->
          <button
            v-if="si.docstatus === 0"
            class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
            @click="router.push({ name: 'InvoiceEdit', params: { name: invoiceName } })"
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
            <span class="text-[11px] font-mono text-muted/80">{{ si.name }}</span>
            <StatusBadge :label="statusLabel(si)" :color-class="statusBadgeClass(si)" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight mb-1">
            {{ si.customer_name || si.customer || '—' }}
          </h1>
          <p class="text-xs text-muted">{{ fmtDate(si.posting_date) }}</p>
        </div>

        <!-- Action / share error banner -->
        <div
          v-if="actionError || shareError"
          class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {{ actionError || shareError }}
        </div>

        <!-- Payment status bar (submitted, non-return invoices) -->
        <SectionCard v-if="si.docstatus === 1 && !si.is_return" title="Payment Status">
          <div class="px-4 py-3">
            <div class="flex justify-between text-sm mb-2">
              <span class="text-muted">Outstanding</span>
              <span
                class="font-semibold"
                :class="si.outstanding_amount > 0 ? 'text-red-600' : 'text-green-600'"
              >
                {{ currency }} {{ fmt(si.outstanding_amount) }}
              </span>
            </div>
            <div class="h-2 bg-muted/20 rounded-full">
              <div
                :style="{ width: paidPct + '%' }"
                class="h-2 bg-green-500 rounded-full transition-all duration-500"
              />
            </div>
            <div class="flex justify-between text-xs text-muted mt-1.5">
              <span>Paid {{ paidPct }}%</span>
              <span v-if="si.due_date">Due {{ fmtDate(si.due_date) }}</span>
            </div>
          </div>
        </SectionCard>

        <!-- Items card -->
        <SectionCard title="Items">
          <div class="divide-y divide-muted/10">
            <div
              v-for="item in si.items ?? []"
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
            <div v-if="!si.items?.length" class="px-4 py-4 text-sm text-muted text-center">
              No items
            </div>
          </div>
        </SectionCard>

        <!-- Linked documents card -->
        <SectionCard
          v-if="linkedSOs.length || linkedDNs.length || si.advances?.length"
          title="Linked Documents"
        >
          <div class="divide-y divide-muted/10">
            <!-- Linked Sales Orders -->
            <button
              v-for="soName in linkedSOs"
              :key="soName"
              class="w-full flex items-center justify-between px-4 py-3 text-left active:bg-surface transition-colors"
              @click="router.push({ name: 'OrderDetail', params: { name: soName } })"
            >
              <div>
                <p class="text-[11px] text-muted uppercase tracking-wide font-medium mb-0.5">Sales Order</p>
                <span class="text-sm font-medium text-primary font-mono">{{ soName }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <!-- Linked Delivery Notes -->
            <button
              v-for="dnName in linkedDNs"
              :key="dnName"
              class="w-full flex items-center justify-between px-4 py-3 text-left active:bg-surface transition-colors"
              @click="router.push({ name: 'DeliveryNoteDetail', params: { name: dnName } })"
            >
              <div>
                <p class="text-[11px] text-muted uppercase tracking-wide font-medium mb-0.5">Delivery Note</p>
                <span class="text-sm font-medium text-primary font-mono">{{ dnName }}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <!-- Payment Entries (non-tappable — no PE detail route) -->
            <div
              v-for="adv in (si.advances ?? [])"
              :key="adv.name ?? adv.reference_name"
              class="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p class="text-[11px] text-muted uppercase tracking-wide font-medium mb-0.5">Payment Entry</p>
                <span class="text-sm font-medium text-gray-700 font-mono">{{ adv.reference_name }}</span>
              </div>
              <span class="text-sm font-semibold text-green-700 shrink-0">
                {{ currency }} {{ fmt(adv.allocated_amount) }}
              </span>
            </div>
          </div>
        </SectionCard>

        <!-- Summary card -->
        <SectionCard title="Summary">
          <div class="px-4 py-3 space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Net Total</span>
              <span>{{ currency }} {{ fmt(si.net_total ?? si.total) }}</span>
            </div>
            <template v-for="tax in si.taxes ?? []" :key="tax.name ?? tax.idx">
              <div class="flex justify-between text-sm text-gray-600">
                <span class="truncate pr-2">{{ tax.description || tax.account_head }} ({{ tax.rate }}%)</span>
                <span class="shrink-0">{{ currency }} {{ fmt(tax.tax_amount) }}</span>
              </div>
            </template>
            <div v-if="si.discount_amount > 0" class="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>− {{ currency }} {{ fmt(si.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
              <span>Grand Total</span>
              <span>{{ currency }} {{ fmt(si.grand_total) }}</span>
            </div>
          </div>
        </SectionCard>

        <!-- Terms card -->
        <SectionCard v-if="si.terms" title="Terms &amp; Conditions">
          <div class="px-4 py-3">
            <p class="text-sm text-gray-700 whitespace-pre-line">{{ si.terms }}</p>
          </div>
        </SectionCard>

      </div>

      <!-- ── Action footer ─────────────────────────────────────────────────── -->
      <ActionFooter v-if="showActions">

        <!-- Draft: Edit + Submit -->
        <div v-if="si.docstatus === 0" class="flex gap-2">
          <button
            class="flex-1 bg-white border border-muted/40 text-gray-700 rounded-xl py-3 font-semibold text-sm active:scale-[.97] transition-transform"
            @click="router.push({ name: 'InvoiceEdit', params: { name: invoiceName } })"
          >
            Edit
          </button>
          <button
            class="flex-1 bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning && actionTarget === 'submit' ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleSubmit"
          >
            <svg v-if="actioning && actionTarget === 'submit'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'submit' ? 'Submitting…' : 'Submit' }}
          </button>
        </div>

        <!-- Submitted + outstanding > 0 + not return: Record Payment + Credit Note -->
        <div v-else-if="si.docstatus === 1 && si.outstanding_amount > 0 && !si.is_return" class="flex gap-2">
          <button
            class="flex-1 bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning && actionTarget === 'payment' ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleRecordPayment"
          >
            <svg v-if="actioning && actionTarget === 'payment'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'payment' ? 'Loading…' : 'Record Payment' }}
          </button>
          <button
            class="flex-1 bg-white border border-muted/40 text-gray-700 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning && actionTarget === 'cn' ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleCreditNote"
          >
            <svg v-if="actioning && actionTarget === 'cn'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'cn' ? 'Creating…' : 'Credit Note' }}
          </button>
        </div>

        <!-- Submitted + fully paid + not return -->
        <div v-else-if="si.docstatus === 1 && si.outstanding_amount <= 0 && !si.is_return" class="text-center">
          <p class="text-sm text-green-700 font-semibold">✓ Fully Paid</p>
          <p class="text-xs text-muted mt-0.5">This invoice has been settled</p>
        </div>

        <!-- Return (credit note) -->
        <div v-else-if="si.is_return" class="text-center">
          <p class="text-sm text-purple-700 font-semibold">Credit Note — Return Invoice</p>
          <p v-if="si.return_against" class="text-xs text-muted mt-0.5">Return for {{ si.return_against }}</p>
        </div>

        <!-- Cancelled: Amend -->
        <div v-else-if="si.docstatus === 2">
          <button
            class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning && actionTarget === 'amend' ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleAmend"
          >
            <svg v-if="actioning && actionTarget === 'amend'" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning && actionTarget === 'amend' ? 'Creating…' : 'Amend' }}
          </button>
        </div>

      </ActionFooter>

    </template>

    <!-- ── Payment Entry bottom sheet ──────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="sheet">
        <div
          v-if="peSheetOpen"
          class="fixed inset-0 z-50 flex flex-col justify-end"
          style="max-width: 480px; margin-inline: auto;"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40" @click="peSheetOpen = false" />

          <!-- Sheet -->
          <div class="relative bg-white rounded-t-3xl px-4 pt-4 pb-10 shadow-2xl">
            <!-- Drag pill -->
            <div class="w-10 h-1 bg-muted/30 rounded-full mx-auto mb-5" />
            <p class="text-base font-bold text-gray-800 mb-4">Record Payment</p>

            <!-- Loading state -->
            <div v-if="peLoading" class="flex justify-center py-8">
              <svg class="w-6 h-6 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>

            <template v-else>
              <!-- PE error -->
              <div
                v-if="peError"
                class="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
              >
                {{ peError }}
              </div>

              <!-- Amount -->
              <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amount</label>
                <input
                  v-model.number="peAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <!-- Mode of Payment -->
              <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mode of Payment</label>
                <select
                  v-model="peMode"
                  class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:outline-none focus:border-primary"
                >
                  <option v-for="m in peModes" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <!-- Reference No -->
              <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reference No</label>
                <input
                  v-model="peRef"
                  type="text"
                  placeholder="Cheque / transfer reference"
                  class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <!-- Reference Date -->
              <div class="mb-5">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reference Date</label>
                <input
                  v-model="peDate"
                  type="date"
                  class="w-full px-4 py-3 text-sm bg-surface rounded-xl border border-muted/40 focus:outline-none focus:border-primary"
                />
              </div>

              <!-- Submit payment -->
              <button
                class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform mb-3"
                :class="peSaving ? 'opacity-70 pointer-events-none' : ''"
                :disabled="peSaving"
                @click="handleSubmitPayment"
              >
                <svg v-if="peSaving" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {{ peSaving ? 'Saving…' : 'Submit Payment' }}
              </button>

              <!-- Cancel -->
              <button
                class="w-full py-3 rounded-xl bg-surface text-sm font-semibold text-gray-600 active:bg-muted/20 transition-colors"
                @click="peSheetOpen = false"
              >
                Cancel
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoices'
import ShareButton from '@/components/shared/ShareButton.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SectionCard from '@/components/shared/SectionCard.vue'
import ActionFooter from '@/components/shared/ActionFooter.vue'
import StatusBadge from '@/components/shared/StatusBadge.vue'
import DetailTopNav from '@/components/shared/DetailTopNav.vue'
import { useFormatters } from '@/composables/useFormatters'

const route        = useRoute()
const router       = useRouter()
const invoiceStore = useInvoiceStore()

const invoiceName = route.params.name
const { fmt, fmtDate } = useFormatters()

// ── State ─────────────────────────────────────────────────────────────────────
const si          = ref(null)
const loading     = ref(true)
const error       = ref(null)
const actioning   = ref(false)
const actionTarget = ref('')  // 'submit' | 'payment' | 'cn' | 'amend'
const actionError = ref(null)
const shareError  = ref(null)

// Payment Entry sheet
const peSheetOpen = ref(false)
const peLoading   = ref(false)
const peDoc       = ref(null)
const peSaving    = ref(false)
const peError     = ref(null)
const peAmount    = ref(0)
const peMode      = ref('')
const peRef       = ref('')
const peDate      = ref(today())
const peModes     = ref([])

// ── Computed ──────────────────────────────────────────────────────────────────
const currency = computed(() => si.value?.currency || 'AED')

const paidPct = computed(() => {
  if (!si.value?.grand_total) return 0
  const paid = (si.value.grand_total - (si.value.outstanding_amount ?? 0))
  return Math.min(100, Math.round((paid / si.value.grand_total) * 100))
})

const linkedSOs = computed(() =>
  [...new Set((si.value?.items ?? []).map(r => r.sales_order).filter(Boolean))],
)

const linkedDNs = computed(() =>
  [...new Set((si.value?.items ?? []).map(r => r.delivery_note).filter(Boolean))],
)

const showActions = computed(() => {
  const s = si.value
  if (!s) return false
  return s.docstatus === 0 || s.docstatus === 1 || s.docstatus === 2
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10) }

function statusLabel(s) {
  if (s.docstatus === 2) return 'Cancelled'
  if (s.docstatus === 0) return 'Draft'
  if (s.is_return)       return 'Return'
  return s.status || 'Unpaid'
}

function statusBadgeClass(s) {
  if (s.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (s.docstatus === 0) return 'bg-gray-100 text-gray-600'
  if (s.is_return)       return 'bg-purple-50 text-purple-700'
  const map = {
    Unpaid:  'bg-amber-50 text-amber-700',
    Overdue: 'bg-red-50 text-red-700',
    Paid:    'bg-green-50 text-green-700',
  }
  return map[s.status] ?? 'bg-gray-100 text-gray-600'
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadInvoice() {
  loading.value = true
  error.value   = null
  try {
    si.value = await invoiceStore.fetchInvoice(invoiceName)
  } catch (e) {
    error.value = e?.message ?? 'Failed to load invoice'
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
    await invoiceStore.submitInvoice(invoiceName, si.value)
    si.value = await invoiceStore.fetchInvoice(invoiceName)
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to submit invoice'
  } finally {
    actioning.value    = false
    actionTarget.value = ''
  }
}

async function handleRecordPayment() {
  peSheetOpen.value = true
  peLoading.value   = true
  peError.value     = null
  actionTarget.value = 'payment'
  try {
    const [modes, pe] = await Promise.all([
      invoiceStore.fetchPaymentModes(),
      invoiceStore.makePaymentEntry(invoiceName),
    ])
    peModes.value  = modes
    peDoc.value    = pe
    peAmount.value = pe?.paid_amount ?? si.value?.outstanding_amount ?? 0
    peMode.value   = pe?.mode_of_payment ?? (modes[0] ?? '')
    peRef.value    = ''
    peDate.value   = today()
  } catch (e) {
    peError.value = e?.message ?? 'Could not load payment entry'
  } finally {
    peLoading.value    = false
    actioning.value    = false
    actionTarget.value = ''
  }
}

async function handleSubmitPayment() {
  if (!peDoc.value) return
  peSaving.value = true
  peError.value  = null
  try {
    const doc = {
      ...peDoc.value,
      paid_amount:      peAmount.value,
      received_amount:  peAmount.value,
      mode_of_payment:  peMode.value,
      reference_no:     peRef.value,
      reference_date:   peDate.value,
    }
    await invoiceStore.submitPaymentEntry(doc)
    peSheetOpen.value = false
    si.value = await invoiceStore.fetchInvoice(invoiceName)
  } catch (e) {
    peError.value = e?.message ?? 'Payment submission failed'
  } finally {
    peSaving.value = false
  }
}

async function handleCreditNote() {
  actioning.value    = true
  actionTarget.value = 'cn'
  actionError.value  = null
  try {
    const returnDoc = await invoiceStore.makeReturnDoc(invoiceName)
    invoiceStore.setPrefill(returnDoc)
    router.push({ name: 'InvoiceNew' })
  } catch (e) {
    actionError.value  = e?.message ?? 'Failed to create Credit Note'
    actioning.value    = false
    actionTarget.value = ''
  }
}

async function handleAmend() {
  actioning.value    = true
  actionTarget.value = 'amend'
  actionError.value  = null
  try {
    const amended = await invoiceStore.amendInvoice(invoiceName)
    const newName = amended?.name ?? amended?.data?.name
    if (newName) {
      router.push({ name: 'InvoiceDetail', params: { name: newName } })
    } else {
      throw new Error('Amended document name not found')
    }
  } catch (e) {
    actionError.value  = e?.message ?? 'Failed to amend invoice'
    actioning.value    = false
    actionTarget.value = ''
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
onMounted(loadInvoice)
</script>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.25s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}
</style>
