<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Pull-to-refresh indicator ──────────────────────────────────────── -->
    <div
      class="flex items-center justify-center overflow-hidden transition-all duration-200"
      :style="{ height: refreshing ? '52px' : `${pullRatio * 52}px`, opacity: Math.max(pullRatio, refreshing ? 1 : 0) }"
    >
      <svg
        class="w-5 h-5 text-primary"
        :class="refreshing ? 'animate-spin' : ''"
        :style="{ transform: refreshing ? '' : `rotate(${pullRatio * 360}deg)` }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    </div>

    <!-- ── Hero card (minimal) ─────────────────────────────────────────────── -->
    <div
      class="mx-4 mt-3 rounded-2xl px-5 py-4 text-white"
      style="background: linear-gradient(135deg, #245F73 0%, #163d4e 100%)"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-white/50 text-[10px] uppercase tracking-widest font-medium truncate">
            {{ defaultsStore.company || 'SalesHub' }}
          </p>
          <p class="text-white font-bold text-[19px] leading-tight mt-0.5">
            Good {{ greeting }}, {{ firstName }}
          </p>
          <p class="text-white/40 text-[11px] mt-1.5">{{ fmtHeroDate() }}</p>
        </div>
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            v-if="userInfo?.user_image"
            :src="userInfo.user_image"
            class="w-full h-full object-cover"
            alt=""
          />
          <span v-else class="text-white font-bold text-sm">{{ initials }}</span>
        </div>
      </div>
    </div>

    <!-- ── Stats grid (2×2) ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 gap-3 px-4 mt-4">

      <!-- Skeleton (first load) -->
      <template v-if="loading && !firstLoaded">
        <div v-for="n in 4" :key="n" class="bg-white rounded-2xl h-28 animate-pulse border border-muted/20" />
      </template>

      <!-- Live stat cards -->
      <template v-else>

        <!-- Today's Quotes -->
        <div class="bg-white rounded-2xl overflow-hidden border border-muted/20 shadow-sm">
          <div class="h-1 bg-primary/70" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-2.5">
              <p class="text-[10px] text-muted/80 uppercase tracking-wide font-semibold">Quotes Today</p>
              <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
            </div>
            <p class="text-[28px] font-bold text-primary leading-none">{{ stats.todayQCount }}</p>
            <p class="text-[11px] text-muted mt-1">{{ defaultsStore.currency }} {{ fmtShort(stats.todayQValue) }}</p>
          </div>
        </div>

        <!-- Open Orders -->
        <div class="bg-white rounded-2xl overflow-hidden border border-muted/20 shadow-sm">
          <div class="h-1 bg-amber-400" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-2.5">
              <p class="text-[10px] text-muted/80 uppercase tracking-wide font-semibold">Open Orders</p>
              <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
            </div>
            <p class="text-[28px] font-bold text-amber-600 leading-none">{{ stats.openSOCount }}</p>
            <p class="text-[11px] text-muted mt-1">{{ defaultsStore.currency }} {{ fmtShort(stats.openSOValue) }}</p>
          </div>
        </div>

        <!-- Pending Deliveries -->
        <div class="bg-white rounded-2xl overflow-hidden border border-muted/20 shadow-sm">
          <div class="h-1 bg-blue-400" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-2.5">
              <p class="text-[10px] text-muted/80 uppercase tracking-wide font-semibold">Pending DNs</p>
              <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
            </div>
            <p class="text-[28px] font-bold text-blue-600 leading-none">{{ stats.pendingDNs }}</p>
            <p class="text-[11px] text-muted mt-1">awaiting invoice</p>
          </div>
        </div>

        <!-- Monthly Revenue -->
        <div class="bg-white rounded-2xl overflow-hidden border border-muted/20 shadow-sm">
          <div class="h-1 bg-green-400" />
          <div class="p-4">
            <div class="flex items-center justify-between mb-2.5">
              <p class="text-[10px] text-muted/80 uppercase tracking-wide font-semibold">Monthly Rev.</p>
              <div class="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
            </div>
            <p class="text-[28px] font-bold text-green-600 leading-none">{{ fmtShort(stats.monthlyRev) }}</p>
            <p class="text-[11px] text-muted mt-1">{{ defaultsStore.currency }} · this month</p>
          </div>
        </div>

      </template>
    </div>

    <!-- ── Recent Activity ─────────────────────────────────────────────────── -->
    <div class="px-4 mt-5 pb-36">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recent Activity</h2>
        <button
          class="text-xs text-primary font-semibold"
          @click="router.push({ name: 'Orders' })"
        >See all →</button>
      </div>

      <!-- Activity skeleton -->
      <template v-if="loading && !firstLoaded">
        <div class="space-y-px">
          <div v-for="n in 5" :key="n"
            class="h-[62px] bg-white animate-pulse border border-muted/20"
            :class="n === 1 ? 'rounded-t-2xl' : n === 5 ? 'rounded-b-2xl' : ''"
          />
        </div>
      </template>

      <!-- Activity list -->
      <template v-else-if="activity.length > 0">
        <div class="overflow-hidden rounded-2xl border border-muted/20 divide-y divide-muted/10 shadow-sm">
          <button
            v-for="item in activity"
            :key="item.name + item._type"
            class="w-full flex items-center gap-3 px-4 py-3 bg-white text-left active:bg-surface transition-colors"
            @click="goToActivity(item)"
          >
            <!-- Doc-type icon circle -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="typeIconBg(item._type)"
            >
              <svg v-if="item._type === 'Quotation'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <svg v-else-if="item._type === 'Sales Order'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>

            <!-- Text -->
            <div class="flex-1 min-w-0">
              <!-- Row 1: type pill + doc name + status badge -->
              <div class="flex items-center gap-1.5 mb-0.5">
                <span
                  class="shrink-0 px-1.5 py-[2px] rounded text-[8px] font-bold uppercase tracking-wide"
                  :class="typePillClass(item._type)"
                >{{ typeAbbr(item._type) }}</span>
                <span class="text-[11px] font-mono text-gray-700 font-medium truncate">{{ item.name }}</span>
                <span
                  class="shrink-0 px-1.5 py-[2px] rounded-full text-[9px] font-semibold"
                  :class="activityBadge(item)"
                >{{ activityLabel(item) }}</span>
              </div>
              <!-- Row 2: customer + time -->
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs text-muted truncate">{{ item.customer_name || '—' }}</span>
                <span class="text-[10px] text-muted/70 shrink-0">{{ relativeTime(item.modified) }}</span>
              </div>
            </div>

            <!-- Amount -->
            <div class="text-right shrink-0 ml-1">
              <p class="text-sm font-semibold text-gray-800">{{ fmtShort(item.grand_total) }}</p>
            </div>
          </button>
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3 border border-muted/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="text-sm font-semibold text-gray-700">No recent activity</p>
        <p class="text-xs text-muted mt-1">Create a quotation or sales order to get started</p>
      </div>
    </div>

    <!-- ── Multi-action FAB (speed-dial) ───────────────────────────────────── -->

    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="fabOpen"
        class="fixed inset-0 z-30 bg-black/20"
        @click="fabOpen = false"
      />
    </Transition>

    <!-- Speed-dial -->
    <div class="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-2.5">

      <!-- Child actions -->
      <template v-for="(action, i) in fabActions" :key="action.label">
        <Transition
          name="fab-item"
          :style="{
            transitionDelay: fabOpen
              ? `${i * 50}ms`
              : `${(fabActions.length - 1 - i) * 30}ms`,
          }"
        >
          <div v-show="fabOpen" class="flex items-center gap-2">
            <span class="bg-white shadow-md rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700 whitespace-nowrap">
              {{ action.label }}
            </span>
            <button
              class="w-12 h-12 rounded-full shadow-lg text-white flex items-center justify-center active:scale-95 transition-transform"
              :class="action.color"
              @click="fabOpen = false; router.push(action.route)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" v-html="action.iconPath" />
            </button>
          </div>
        </Transition>
      </template>

      <!-- Main FAB -->
      <button
        class="w-14 h-14 bg-primary rounded-full shadow-xl text-white flex items-center justify-center active:scale-95 transition-transform"
        @click="fabOpen = !fabOpen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 transition-transform duration-200"
          :class="fabOpen ? 'rotate-45' : ''"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFrappeAuth } from '@/composables/useFrappeAuth'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useDefaultsStore } from '@/stores/defaults'
import { api } from '@/composables/useApi'

const router        = useRouter()
const { userInfo }  = useFrappeAuth()
const defaultsStore = useDefaultsStore()
const scrollEl      = inject('scrollEl')

// ── PTR ───────────────────────────────────────────────────────────────────────
const { pullRatio, refreshing } = usePullToRefresh(scrollEl, () => loadDashboard(true))

// ── UI state ──────────────────────────────────────────────────────────────────
const loading     = ref(false)
const firstLoaded = ref(false)
const activity    = ref([])

const stats = reactive({
  todayQCount: 0,
  todayQValue: 0,
  openSOCount: 0,
  openSOValue: 0,
  pendingDNs:  0,
  monthlyRev:  0,
})

// ── FAB ───────────────────────────────────────────────────────────────────────
const fabOpen    = ref(false)
const fabActions = [
  {
    label: 'New Quotation',
    route: { name: 'QuotationNew' },
    color: 'bg-primary',
    iconPath: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  },
  {
    label: 'New Sales Order',
    route: { name: 'OrderNew' },
    color: 'bg-amber-500',
    iconPath: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  },
  {
    label: 'New Customer',
    route: { name: 'CustomerNew' },
    color: 'bg-accent',
    iconPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>',
  },
]

// ── Computed ──────────────────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = userInfo.value?.full_name || 'there'
  return name.split(' ')[0]
})

const initials = computed(() => {
  const name = userInfo.value?.full_name || '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

// ── Data ──────────────────────────────────────────────────────────────────────
const ACT_FIELDS    = ['name', 'customer_name', 'transaction_date', 'grand_total', 'modified', 'status', 'docstatus']
const ACT_DN_FIELDS = ['name', 'customer_name', 'posting_date', 'grand_total', 'modified', 'status', 'docstatus']

function unwrap(r) {
  return r.status === 'fulfilled' ? (r.value?.data ?? r.value ?? []) : []
}

async function loadDashboard(force = false) {
  if (loading.value && !force) return
  loading.value = true

  try {
    await defaultsStore.fetchDefaults(force)

    const now          = new Date()
    const today        = now.toISOString().slice(0, 10)
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

    const [qToday, soOpen, dnPending, soMonth, actQ, actSO, actDN] =
      await Promise.allSettled([
        api.getList('Quotation', {
          fields: ['name', 'grand_total'],
          filters: [['transaction_date', '=', today], ['docstatus', '!=', 2]],
          limit: 500,
        }),
        api.getList('Sales Order', {
          fields: ['name', 'grand_total'],
          filters: [['docstatus', '=', 1], ['status', 'in', ['To Deliver and Bill', 'To Bill', 'To Deliver']]],
          limit: 500,
        }),
        api.getList('Delivery Note', {
          fields: ['name'],
          filters: [['docstatus', '=', 1], ['status', '=', 'To Bill']],
          limit: 999,
        }),
        api.getList('Sales Order', {
          fields: ['name', 'grand_total'],
          filters: [['transaction_date', 'between', [firstOfMonth, today]], ['docstatus', '=', 1]],
          limit: 500,
        }),
        api.getList('Quotation',     { fields: ACT_FIELDS,    limit: 5, orderBy: 'modified desc' }),
        api.getList('Sales Order',   { fields: ACT_FIELDS,    limit: 5, orderBy: 'modified desc' }),
        api.getList('Delivery Note', { fields: ACT_DN_FIELDS, limit: 5, orderBy: 'modified desc' }),
      ])

    const qT  = unwrap(qToday)
    const soO = unwrap(soOpen)
    const dnP = unwrap(dnPending)
    const soM = unwrap(soMonth)

    stats.todayQCount = qT.length
    stats.todayQValue = qT.reduce((s, r) => s + (r.grand_total || 0), 0)
    stats.openSOCount = soO.length
    stats.openSOValue = soO.reduce((s, r) => s + (r.grand_total || 0), 0)
    stats.pendingDNs  = dnP.length
    stats.monthlyRev  = soM.reduce((s, r) => s + (r.grand_total || 0), 0)

    activity.value = [
      ...unwrap(actQ).map((r)  => ({ ...r, _type: 'Quotation' })),
      ...unwrap(actSO).map((r) => ({ ...r, _type: 'Sales Order' })),
      ...unwrap(actDN).map((r) => ({ ...r, _type: 'Delivery Note', transaction_date: r.posting_date })),
    ]
      .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      .slice(0, 10)

  } catch (e) {
    console.error('[Home] loadDashboard failed', e)
  } finally {
    loading.value     = false
    firstLoaded.value = true
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
function goToActivity(item) {
  const routeMap = {
    Quotation:       'QuotationDetail',
    'Sales Order':   'OrderDetail',
    'Delivery Note': 'DeliveryNoteDetail',
  }
  const name = routeMap[item._type]
  if (name) router.push({ name, params: { name: item.name } })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function typeIconBg(type) {
  return {
    Quotation:       'bg-primary/10 text-primary',
    'Sales Order':   'bg-amber-50 text-amber-600',
    'Delivery Note': 'bg-blue-50 text-blue-600',
  }[type] ?? 'bg-gray-100 text-gray-500'
}

function typePillClass(type) {
  return {
    Quotation:       'bg-primary text-white',
    'Sales Order':   'bg-amber-500 text-white',
    'Delivery Note': 'bg-blue-500 text-white',
  }[type] ?? 'bg-gray-400 text-white'
}

function typeAbbr(type) {
  return {
    Quotation:       'QTN',
    'Sales Order':   'SO',
    'Delivery Note': 'DN',
  }[type] ?? '?'
}

function activityLabel(item) {
  if (item.docstatus === 2) return 'Cancelled'
  if (item.docstatus === 0) return 'Draft'
  return item.status || 'Open'
}

function activityBadge(item) {
  if (item.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (item.docstatus === 0) return 'bg-gray-100 text-gray-600'
  return {
    Open:                  'bg-primary/10 text-primary',
    Replied:               'bg-amber-50 text-amber-700',
    Ordered:               'bg-green-50 text-green-700',
    'To Deliver and Bill': 'bg-primary/10 text-primary',
    'To Bill':             'bg-amber-50 text-amber-700',
    'To Deliver':          'bg-blue-50 text-blue-700',
    Completed:             'bg-green-50 text-green-700',
  }[item.status] ?? 'bg-gray-100 text-gray-600'
}

function relativeTime(modified) {
  const diff = Date.now() - new Date(modified)
  if (diff < 60_000)      return 'Just now'
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 172_800_000) return 'Yesterday'
  return fmtDate(modified)
}

function fmtHeroDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function fmtDate(d) {
  return d
    ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
}

const _fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
function fmtShort(n) {
  const v = Math.abs(n ?? 0)
  if (v >= 1_000_000) return `${_fmt.format(Math.round(v / 1_000))}K`
  if (v >= 10_000)    return `${_fmt.format(Math.round(v / 1_000))}K`
  if (v >= 1_000)     return `${_fmt.format(Math.round(v / 100) / 10)}K`
  return _fmt.format(v)
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(loadDashboard)
</script>

<style scoped>
.fab-item-enter-active,
.fab-item-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fab-item-enter-from,
.fab-item-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
