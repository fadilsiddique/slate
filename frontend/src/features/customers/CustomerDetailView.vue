<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Loading state ─────────────────────────────────────────────────── -->
    <template v-if="loading">
      <!-- Nav bar skeleton -->
      <div class="flex items-center justify-between px-4 pt-4 pb-2">
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
        <div class="w-8 h-8 rounded-xl bg-muted/20 animate-pulse" />
      </div>
      <!-- Header skeleton -->
      <div class="bg-white px-4 pt-4 pb-5 flex flex-col items-center gap-3">
        <div class="w-16 h-16 rounded-full bg-muted/20 animate-pulse" />
        <div class="w-40 h-5 bg-surface rounded animate-pulse" />
        <div class="w-24 h-4 bg-surface rounded animate-pulse" />
      </div>
      <!-- Card skeletons -->
      <div class="px-4 py-4 space-y-4">
        <div class="h-24 bg-white rounded-2xl animate-pulse border border-muted/20" />
        <div class="h-16 bg-white rounded-2xl animate-pulse border border-muted/20" />
        <div class="h-20 bg-white rounded-2xl animate-pulse border border-muted/20" />
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
        <p class="font-semibold text-gray-800">Customer not found</p>
        <p class="text-sm text-muted mt-1">{{ error }}</p>
        <button class="mt-5 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold" @click="reload">
          Retry
        </button>
      </div>
    </template>

    <!-- ── Loaded ─────────────────────────────────────────────────────────── -->
    <template v-else-if="customer">

      <!-- Top nav bar (absolute — floats over header card) -->
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
          @click="router.push({ name: 'CustomerEdit', params: { name: customer.name } })"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      <!-- ── Header card ────────────────────────────────────────────────────── -->
      <div class="bg-white px-4 pt-16 pb-5 flex flex-col items-center text-center">
        <!-- Avatar -->
        <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-3">
          {{ initials }}
        </div>
        <!-- Name -->
        <h1 class="text-xl font-bold text-gray-900 leading-tight">
          {{ customer.customer_name }}
        </h1>
        <!-- Badges -->
        <div class="flex gap-2 mt-2 flex-wrap justify-center">
          <span
            class="px-2 py-0.5 text-xs rounded-full font-medium"
            :class="customer.customer_type === 'Company'
              ? 'bg-primary/10 text-primary'
              : 'bg-accent/10 text-accent'"
          >{{ customer.customer_type || 'Individual' }}</span>
          <span
            v-if="customer.customer_group"
            class="px-2 py-0.5 bg-surface text-muted text-xs rounded-full font-medium border border-muted/30"
          >{{ customer.customer_group }}</span>
          <span
            v-if="customer.territory"
            class="px-2 py-0.5 bg-surface text-muted text-xs rounded-full font-medium border border-muted/30"
          >{{ customer.territory }}</span>
        </div>
      </div>

      <!-- ── Content cards ──────────────────────────────────────────────────── -->
      <div class="px-4 space-y-4 py-4 pb-8">

        <!-- ── Contact card ────────────────────────────────────────────────── -->
        <section>
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Contact</h2>
          <div class="bg-white rounded-2xl divide-y divide-muted/20 overflow-hidden">
            <template v-if="primaryContact">
              <!-- Name row -->
              <div class="px-4 py-3">
                <p class="text-sm font-semibold text-gray-900">
                  {{ [primaryContact.first_name, primaryContact.last_name].filter(Boolean).join(' ') || primaryContact.full_name || '—' }}
                </p>
                <span v-if="primaryContact.is_primary_contact" class="text-[10px] text-primary font-medium">Primary contact</span>
              </div>
              <!-- Phone (tappable) -->
              <a
                v-if="primaryContact.mobile_no || primaryContact.phone"
                :href="`tel:${primaryContact.mobile_no || primaryContact.phone}`"
                class="flex items-center gap-3 px-4 py-3 active:bg-surface"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.73 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.67 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.92a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                </svg>
                <span class="text-sm text-primary font-medium">
                  {{ primaryContact.mobile_no || primaryContact.phone }}
                </span>
              </a>
              <!-- Email (tappable) -->
              <a
                v-if="primaryContact.email_id"
                :href="`mailto:${primaryContact.email_id}`"
                class="flex items-center gap-3 px-4 py-3 active:bg-surface"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span class="text-sm text-primary font-medium truncate">{{ primaryContact.email_id }}</span>
              </a>
            </template>
            <p v-else class="px-4 py-3 text-sm text-muted italic">No contact on file</p>
          </div>
        </section>

        <!-- ── Address card ────────────────────────────────────────────────── -->
        <section>
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Address</h2>
          <div class="bg-white rounded-2xl px-4 py-3">
            <p v-if="primaryAddress" class="text-sm text-gray-700 leading-relaxed">
              {{
                [
                  primaryAddress.address_line1,
                  primaryAddress.address_line2,
                  primaryAddress.city,
                  primaryAddress.state,
                  primaryAddress.pincode,
                  primaryAddress.country,
                ].filter(Boolean).join(', ')
              }}
            </p>
            <p v-else class="text-sm text-muted italic">No address on file</p>
          </div>
        </section>

        <!-- ── Financials card ─────────────────────────────────────────────── -->
        <section>
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Financials</h2>
          <div class="bg-white rounded-2xl divide-y divide-muted/20 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3">
              <p class="text-sm text-gray-600">Outstanding</p>
              <p class="text-sm font-bold" :class="dash && dash.total_unpaid > 0 ? 'text-red-600' : 'text-gray-900'">
                {{ dash ? `${dash.currency ?? 'AED'} ${fmt(dash.total_unpaid ?? 0)}` : '—' }}
              </p>
            </div>
            <div class="flex items-center justify-between px-4 py-3">
              <p class="text-sm text-gray-600">Billed This Year</p>
              <p class="text-sm font-bold text-gray-900">
                {{ dash ? `${dash.currency ?? 'AED'} ${fmt(dash.billing_this_year ?? 0)}` : '—' }}
              </p>
            </div>
          </div>
        </section>

        <!-- ── Transactions section ────────────────────────────────────────── -->
        <section>
          <h2 class="text-xs font-bold text-muted uppercase tracking-wider mb-2">Recent Transactions</h2>

          <!-- Tab toggle -->
          <div class="flex bg-surface rounded-xl p-1 mb-3">
            <button
              class="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              :class="activeTab === 'quotations' ? 'bg-white text-primary shadow-sm' : 'text-muted'"
              @click="activeTab = 'quotations'"
            >Quotations</button>
            <button
              class="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              :class="activeTab === 'salesOrders' ? 'bg-white text-primary shadow-sm' : 'text-muted'"
              @click="activeTab = 'salesOrders'"
            >Sales Orders</button>
          </div>

          <!-- Transaction rows -->
          <div class="bg-white rounded-2xl divide-y divide-muted/20 overflow-hidden">
            <template v-if="activeTransactions.length > 0">
              <div
                v-for="txn in activeTransactions"
                :key="txn.name"
                class="flex items-center justify-between px-4 py-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold text-gray-900 truncate">{{ txn.name }}</p>
                  <p class="text-xs text-muted mt-0.5">{{ fmtDate(txn.transaction_date) }}</p>
                </div>
                <div class="flex flex-col items-end gap-1 ml-3 shrink-0">
                  <p class="text-sm font-semibold text-gray-900">{{ fmt(txn.grand_total) }}</p>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="txnBadgeClass(txn)">
                    {{ txnStatusLabel(txn) }}
                  </span>
                </div>
              </div>
            </template>
            <p v-else class="px-4 py-5 text-sm text-muted italic text-center">
              No {{ activeTab === 'quotations' ? 'quotations' : 'sales orders' }} yet
            </p>
          </div>
        </section>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCustomerStore } from '@/stores/customers'

const route         = useRoute()
const router        = useRouter()
const customerStore = useCustomerStore()

const customerName = route.params.name

// ── State ──────────────────────────────────────────────────────────────────────
const customer  = ref(null)
const loading   = ref(true)
const error     = ref('')
const activeTab = ref('quotations')

// ── Computed ───────────────────────────────────────────────────────────────────
const primaryContact = computed(() => customer.value?.contactList?.[0] ?? null)
const primaryAddress = computed(() => customer.value?.addrList?.[0] ?? null)
const dash           = computed(() => customer.value?.dashboardInfo ?? null)

const activeTransactions = computed(() =>
  activeTab.value === 'quotations'
    ? (customer.value?.quotations ?? [])
    : (customer.value?.salesOrders ?? []),
)

const initials = computed(() => {
  const name = customer.value?.customer_name ?? '?'
  return name.split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
})

// ── Formatters ─────────────────────────────────────────────────────────────────
const _fmtNum = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
function fmt(v) { return _fmtNum.format(+v || 0) }

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function txnBadgeClass(txn) {
  if (txn.docstatus === 2) return 'bg-red-100 text-red-600'
  if (txn.docstatus === 0) return 'bg-gray-100 text-gray-500'
  const s = (txn.status ?? '').toLowerCase()
  if (s === 'completed' || s === 'closed') return 'bg-green-100 text-green-700'
  if (s === 'cancelled')                    return 'bg-red-100 text-red-600'
  if (s === 'on hold')                      return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

function txnStatusLabel(txn) {
  if (txn.docstatus === 0) return 'Draft'
  if (txn.docstatus === 2) return 'Cancelled'
  return txn.status ?? 'Submitted'
}

// ── Data loading ───────────────────────────────────────────────────────────────
async function reload() {
  loading.value = true
  error.value   = ''
  try {
    customer.value = await customerStore.fetchCustomerDetail(customerName)
  } catch (e) {
    error.value = e?.message ?? 'Could not load customer'
  } finally {
    loading.value = false
  }
}

onMounted(reload)
</script>
