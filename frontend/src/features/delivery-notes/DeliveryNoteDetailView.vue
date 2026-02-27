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
        <h1 class="text-lg font-bold text-gray-900">Delivery Note</h1>
      </header>
      <ErrorState title="Couldn't load delivery note" :message="error" @retry="loadNote" />
    </template>

    <!-- ── Loaded ──────────────────────────────────────────────────────────── -->
    <template v-else-if="dn">

      <!-- Absolute top nav (back only — no edit for DNs) -->
      <DetailTopNav @back="router.back()">
        <ShareButton
          doctype="Delivery Note"
          :doc-name="dnName"
          :customer-name="dn.customer_name || dn.customer || ''"
          :grand-total="dn.grand_total || 0"
          :currency="currency"
          @error="shareError = $event"
        />
      </DetailTopNav>

      <!-- Content -->
      <div class="pt-16 px-4 pb-36 space-y-4">

        <!-- Header card -->
        <div class="bg-white rounded-2xl px-5 py-4 border border-muted/20 shadow-sm">
          <div class="flex items-start justify-between gap-2 mb-2">
            <span class="text-[11px] font-mono text-muted/80">{{ dn.name }}</span>
            <StatusBadge :label="statusLabel(dn)" :color-class="statusBadgeClass(dn)" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight mb-1">
            {{ dn.customer_name || dn.customer || '—' }}
          </h1>
          <p class="text-xs text-muted">{{ fmtDate(dn.posting_date) }}</p>
        </div>

        <!-- Action error banner -->
        <div
          v-if="actionError || shareError"
          class="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium"
        >
          {{ actionError || shareError }}
        </div>

        <!-- Items card -->
        <SectionCard title="Items">
          <div class="divide-y divide-muted/10">
            <div
              v-for="item in dn.items ?? []"
              :key="item.name ?? item.idx"
              class="px-4 py-3 flex items-start justify-between gap-2"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 leading-tight">{{ item.item_name || item.item_code }}</p>
                <p class="text-[11px] text-muted mt-0.5">
                  {{ item.item_code }}
                  <span v-if="item.warehouse" class="ml-1">· {{ item.warehouse }}</span>
                </p>
                <p class="text-[11px] text-muted">{{ fmt(item.qty) }} {{ item.uom || 'Nos' }} × {{ fmt(item.rate) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-semibold text-gray-800">{{ fmt(item.amount) }}</p>
              </div>
            </div>
            <div v-if="!dn.items?.length" class="px-4 py-4 text-sm text-muted text-center">
              No items
            </div>
          </div>
        </SectionCard>

        <!-- Sales Order reference card -->
        <SectionCard v-if="sourceSoName" title="Source Sales Order">
          <div class="px-4 py-3">
            <button
              class="flex items-center justify-between w-full text-left"
              @click="router.push({ name: 'OrderDetail', params: { name: sourceSoName } })"
            >
              <span class="text-sm font-medium text-primary font-mono">{{ sourceSoName }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </SectionCard>

        <!-- Summary card -->
        <SectionCard title="Summary">
          <div class="px-4 py-3 space-y-2">
            <div class="flex justify-between text-sm text-gray-600">
              <span>Net Total</span>
              <span>{{ currency }} {{ fmt(dn.net_total ?? dn.total) }}</span>
            </div>
            <template v-for="tax in dn.taxes ?? []" :key="tax.name ?? tax.idx">
              <div class="flex justify-between text-sm text-gray-600">
                <span class="truncate pr-2">{{ tax.description || tax.account_head }} ({{ tax.rate }}%)</span>
                <span class="shrink-0">{{ currency }} {{ fmt(tax.tax_amount) }}</span>
              </div>
            </template>
            <div v-if="dn.discount_amount > 0" class="flex justify-between text-sm text-red-600">
              <span>Discount</span>
              <span>− {{ currency }} {{ fmt(dn.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-muted/20">
              <span>Grand Total</span>
              <span>{{ currency }} {{ fmt(dn.grand_total) }}</span>
            </div>
          </div>
        </SectionCard>

        <!-- Terms card -->
        <SectionCard v-if="dn.terms" title="Terms &amp; Conditions">
          <div class="px-4 py-3">
            <div class="terms-html text-sm text-gray-700" v-html="dn.terms" />
          </div>
        </SectionCard>

      </div>

      <!-- ── Action footer ─────────────────────────────────────────────────── -->
      <ActionFooter v-if="showActions">
        <!-- Draft: Submit -->
        <div v-if="dn.docstatus === 0">
          <button
            class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
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

        <!-- Submitted + not Completed: Create Sales Invoice -->
        <div v-else-if="dn.docstatus === 1 && dn.status !== 'Completed'">
          <button
            class="w-full bg-primary text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[.97] transition-transform"
            :class="actioning ? 'opacity-70 pointer-events-none' : ''"
            :disabled="actioning"
            @click="handleCreateSI"
          >
            <svg v-if="actioning" class="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ actioning ? 'Creating…' : 'Create Sales Invoice' }}
          </button>
        </div>

        <!-- Completed -->
        <div v-else-if="dn.docstatus === 1 && dn.status === 'Completed'" class="text-center">
          <p class="text-sm text-green-700 font-semibold">✓ Fully Billed</p>
          <p class="text-xs text-muted mt-0.5">This delivery has been invoiced</p>
        </div>
      </ActionFooter>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeliveryNoteStore } from '@/stores/deliveryNotes'
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
const dnStore      = useDeliveryNoteStore()
const invoiceStore = useInvoiceStore()

const dnName = route.params.name
const { fmt, fmtDate } = useFormatters()

// ── State ─────────────────────────────────────────────────────────────────────
const dn          = ref(null)
const loading     = ref(true)
const error       = ref(null)
const actioning   = ref(false)
const actionError = ref(null)
const shareError  = ref(null)

// ── Computed ──────────────────────────────────────────────────────────────────
const currency = computed(() => dn.value?.currency || 'AED')

const sourceSoName = computed(() =>
  dn.value?.items?.find((r) => r.against_sales_order)?.against_sales_order ?? null,
)

const showActions = computed(() => {
  const d = dn.value
  if (!d) return false
  return d.docstatus === 0 || d.docstatus === 1
})

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadNote() {
  loading.value = true
  error.value   = null
  try {
    dn.value = await dnStore.fetchDeliveryNoteDetail(dnName)
  } catch (e) {
    error.value = e?.message ?? 'Failed to load delivery note'
  } finally {
    loading.value = false
  }
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  actioning.value   = true
  actionError.value = null
  try {
    await dnStore.submitDeliveryNote(dnName, dn.value)
    dn.value = await dnStore.fetchDeliveryNoteDetail(dnName)
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to submit delivery note'
  } finally {
    actioning.value = false
  }
}

async function handleCreateSI() {
  actioning.value   = true
  actionError.value = null
  try {
    const siDoc = await dnStore.createSalesInvoice(dnName)
    invoiceStore.setPrefill(siDoc)
    router.push({ name: 'InvoiceNew' })
  } catch (e) {
    actionError.value = e?.message ?? 'Failed to create Sales Invoice'
    actioning.value   = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusLabel(d) {
  if (d.docstatus === 2) return 'Cancelled'
  if (d.docstatus === 0) return 'Draft'
  return d.status || 'To Bill'
}

function statusBadgeClass(d) {
  if (d.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (d.docstatus === 0) return 'bg-gray-100 text-gray-600'
  const map = {
    'To Bill':  'bg-amber-50 text-amber-700',
    Completed:  'bg-green-50 text-green-700',
  }
  return map[d.status] ?? 'bg-gray-100 text-gray-600'
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(loadNote)
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
