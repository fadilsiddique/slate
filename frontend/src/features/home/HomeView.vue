<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <div
      class="flex items-center justify-center overflow-hidden transition-all duration-200"
      :style="{ height: refreshing ? '44px' : `${pullRatio * 44}px`, opacity: Math.max(pullRatio, refreshing ? 1 : 0) }"
    >
      <svg
        class="w-4 h-4 text-primary"
        :class="refreshing ? 'animate-spin' : ''"
        :style="{ transform: refreshing ? '' : `rotate(${pullRatio * 360}deg)` }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
    </div>

    <!-- ─────────────────────────────────────────────────────────────────── -->
    <!-- HERO — primary screen anchor                                        -->
    <!-- ─────────────────────────────────────────────────────────────────── -->
    <div
      class="mx-4 mt-4 rounded-3xl overflow-hidden text-white"
      style="background: linear-gradient(135deg, #245F73 0%, #163d4e 100%)"
    >
      <div class="px-5 pt-6 pb-5">
        <div class="flex items-start justify-between gap-4">

          <!-- Greeting text block -->
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-semibold text-white/45 uppercase tracking-[0.14em]">
              Good {{ greeting }}
            </p>
            <h1 class="text-[26px] font-bold text-white mt-1.5 leading-[1.1] tracking-tight">
              {{ firstName }}
            </h1>
            <p class="text-[11px] text-white/40 mt-3.5 font-medium">
              {{ defaultsStore.company || 'SalesHub' }} · {{ fmtHeroDate() }}
            </p>
          </div>

          <!-- Bell icon + avatar -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Notification bell -->
            <button
              class="relative w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center active:bg-white/25 transition-colors"
              @click="router.push({ name: 'Notifications' })"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <!-- Unread badge -->
              <span
                v-if="unreadNotifications > 0"
                class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none"
              >
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
              </span>
            </button>

            <!-- Avatar — 44 × 44 touch target -->
            <div class="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center overflow-hidden">
              <img
                v-if="userInfo?.user_image"
                :src="userInfo.user_image"
                class="w-full h-full object-cover"
                alt=""
              />
              <span v-else class="text-white font-bold text-sm select-none">{{ initials }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────────── -->
    <!-- STAT CHIPS — 4-column, equal width, 8 px gap                       -->
    <!-- ─────────────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-4 gap-2 px-4 mt-6">

      <!-- Loading skeleton -->
      <template v-if="loading && !firstLoaded">
        <div
          v-for="n in 4" :key="n"
          class="bg-white rounded-2xl border border-muted/15 animate-pulse"
          style="height: 92px"
        />
      </template>

      <template v-else>

        <!-- Quotes Today -->
        <button
          class="flex flex-col bg-white rounded-2xl border border-muted/15 p-3 text-left min-h-[44px] active:scale-[.97] transition-transform"
          @click="router.push({ name: 'Quotations' })"
        >
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p class="text-[22px] font-bold text-primary leading-none tabular-nums">{{ stats.todayQCount }}</p>
          <p class="text-[8.5px] font-medium text-muted/55 mt-1.5 leading-tight">Quotes Today</p>
        </button>

        <!-- Open Orders -->
        <button
          class="flex flex-col bg-white rounded-2xl border border-muted/15 p-3 text-left min-h-[44px] active:scale-[.97] transition-transform"
          @click="router.push({ name: 'Orders' })"
        >
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <p class="text-[22px] font-bold text-amber-600 leading-none tabular-nums">{{ stats.openSOCount }}</p>
          <p class="text-[8.5px] font-medium text-muted/55 mt-1.5 leading-tight">Open Orders</p>
        </button>

        <!-- Pending Deliveries -->
        <button
          class="flex flex-col bg-white rounded-2xl border border-muted/15 p-3 text-left min-h-[44px] active:scale-[.97] transition-transform"
          @click="router.push({ name: 'DeliveryNotes' })"
        >
          <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <p class="text-[22px] font-bold text-blue-600 leading-none tabular-nums">{{ stats.pendingDNs }}</p>
          <p class="text-[8.5px] font-medium text-muted/55 mt-1.5 leading-tight">Pending Del.</p>
        </button>

        <!-- Monthly Revenue -->
        <button
          class="flex flex-col bg-white rounded-2xl border border-muted/15 p-3 text-left min-h-[44px] active:scale-[.97] transition-transform"
          @click="router.push({ name: 'Invoices' })"
        >
          <div class="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <p class="text-[22px] font-bold text-green-600 leading-none tabular-nums">{{ compactNum(stats.monthlyRev) }}</p>
          <p class="text-[8.5px] font-medium text-muted/55 mt-1.5 leading-tight">{{ defaultsStore.currency }} / Mo</p>
        </button>

      </template>
    </div>

    <!-- ─────────────────────────────────────────────────────────────────── -->
    <!-- PRIORITY ACTIONS — modular, role-aware, collapsible-ready          -->
    <!-- ─────────────────────────────────────────────────────────────────── -->
    <div class="px-4 mt-6">

      <!-- Section header -->
      <div class="flex items-center gap-2 mb-3">
        <h2 class="text-[11px] font-extrabold text-gray-800 uppercase tracking-[0.08em]">Priority</h2>
        <span
          v-if="hasPriority && firstLoaded"
          class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold leading-none"
        >{{ priorityCount }}</span>
      </div>

      <!-- Priority card -->
      <div class="bg-white rounded-2xl border border-muted/15 overflow-hidden divide-y divide-muted/10">

        <!-- Skeleton -->
        <template v-if="loading && !firstLoaded">
          <div class="h-[64px] animate-pulse" />
          <div class="h-[64px] animate-pulse opacity-60" />
        </template>

        <template v-else>

          <!-- Overdue invoices -->
          <button
            v-if="stats.overdueCount > 0"
            class="w-full flex items-center gap-3 px-4 min-h-[64px] text-left active:bg-surface/70 transition-colors"
            @click="router.push({ name: 'Invoices' })"
          >
            <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px] text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0 py-4">
              <p class="text-sm font-semibold text-gray-900 leading-tight">
                {{ stats.overdueCount }} Overdue Invoice{{ stats.overdueCount !== 1 ? 's' : '' }}
              </p>
              <p class="text-xs text-muted mt-0.5">
                {{ defaultsStore.currency }} {{ compactNum(stats.overdueValue) }} outstanding
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted/30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <!-- Delivery notes awaiting invoice -->
          <button
            v-if="stats.pendingDNs > 0"
            class="w-full flex items-center gap-3 px-4 min-h-[64px] text-left active:bg-surface/70 transition-colors"
            @click="router.push({ name: 'DeliveryNotes' })"
          >
            <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px] text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0 py-4">
              <p class="text-sm font-semibold text-gray-900 leading-tight">
                {{ stats.pendingDNs }} {{ stats.pendingDNs !== 1 ? 'Deliveries' : 'Delivery' }} Awaiting Invoice
              </p>
              <p class="text-xs text-muted mt-0.5">Create invoices to complete billing</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted/30 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>

          <!-- Empty — all caught up -->
          <div
            v-if="!hasPriority"
            class="flex items-center gap-3 px-4 min-h-[64px]"
          >
            <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px] text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-700 leading-tight">All caught up</p>
              <p class="text-xs text-muted mt-0.5">No items need immediate attention</p>
            </div>
          </div>

        </template>
      </div>
    </div>

    <!-- ─────────────────────────────────────────────────────────────────── -->
    <!-- RECENT ACTIVITY — scan-optimised, 64 px rows, customer-first       -->
    <!-- ─────────────────────────────────────────────────────────────────── -->
    <div class="px-4 mt-6 pb-36">

      <!-- Section header -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[11px] font-extrabold text-gray-800 uppercase tracking-[0.08em]">Recent Activity</h2>
        <!-- 44 px touch target on the "see all" link -->
        <button
          class="text-[11px] text-primary font-semibold min-h-[44px] flex items-center pl-4"
          @click="router.push({ name: 'Orders' })"
        >See all →</button>
      </div>

      <!-- Loading skeleton -->
      <template v-if="loading && !firstLoaded">
        <div class="bg-white rounded-2xl border border-muted/15 overflow-hidden divide-y divide-muted/10">
          <div
            v-for="n in 5" :key="n"
            class="h-[64px] animate-pulse"
            :class="n % 2 === 0 ? 'bg-white' : 'bg-surface/40'"
          />
        </div>
      </template>

      <!-- Activity list -->
      <template v-else-if="activity.length > 0">
        <div class="bg-white rounded-2xl border border-muted/15 overflow-hidden divide-y divide-muted/10">
          <button
            v-for="item in activity"
            :key="item.name + item._type"
            class="w-full flex items-center gap-3 px-4 min-h-[64px] text-left active:bg-surface/70 transition-colors"
            @click="goToActivity(item)"
          >

            <!-- Doc-type icon — 40 × 40 -->
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              :class="typeIconBg(item._type)"
            >
              <svg v-if="item._type === 'Quotation'" xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <svg v-else-if="item._type === 'Sales Order'" xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <svg v-else-if="item._type === 'Sales Invoice'" xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 2 2 2-2 2 2 3-2V4a2 2 0 0 0-2-2z"/><line x1="16" y1="8" x2="8" y2="8"/><line x1="16" y1="12" x2="8" y2="12"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>

            <!-- Text block — primary then secondary -->
            <div class="flex-1 min-w-0 py-3">
              <!-- Primary: customer name -->
              <p class="text-sm font-semibold text-gray-900 leading-tight truncate">
                {{ item.customer_name || '—' }}
              </p>
              <!-- Secondary: type dot · doc id · time -->
              <div class="flex items-center gap-1.5 mt-1">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="typeDotClass(item._type)" />
                <span class="text-[10px] font-mono text-muted/70 truncate flex-1 min-w-0">{{ item.name }}</span>
                <span class="text-[10px] text-muted/50 shrink-0">{{ relativeTime(item.modified) }}</span>
              </div>
            </div>

            <!-- Right column: amount + status badge -->
            <div class="shrink-0 flex flex-col items-end gap-1.5 py-3">
              <p class="text-sm font-bold text-gray-800 tabular-nums leading-none">
                {{ compactNum(item.grand_total) }}
              </p>
              <span
                class="px-1.5 py-[2px] rounded-full text-[8.5px] font-semibold leading-none"
                :class="activityBadge(item)"
              >{{ activityLabel(item) }}</span>
            </div>

          </button>
        </div>
      </template>

      <!-- Empty state — explicit, with primary action affordance -->
      <div
        v-else
        class="bg-white rounded-2xl border border-muted/15 flex flex-col items-center text-center px-4 py-12"
      >
        <div class="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-muted/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <p class="text-sm font-bold text-gray-800">No activity yet</p>
        <p class="text-xs text-muted mt-1.5 leading-relaxed max-w-[220px]">
          Create a quotation to start tracking your pipeline
        </p>
        <button
          class="mt-6 px-5 min-h-[44px] bg-primary text-white text-sm font-semibold rounded-xl flex items-center active:scale-[.97] transition-transform"
          @click="router.push({ name: 'QuotationNew' })"
        >New Quotation</button>
      </div>

    </div>

    <!-- ─────────────────────────────────────────────────────────────────── -->
    <!-- MULTI-ACTION FAB — above bottom nav, no visual competition         -->
    <!-- ─────────────────────────────────────────────────────────────────── -->

    <Transition name="fade">
      <div
        v-if="fabOpen"
        class="fixed inset-0 z-30 bg-black/20"
        @click="fabOpen = false"
      />
    </Transition>

    <div class="fixed bottom-20 right-4 z-40 flex flex-col-reverse items-end gap-3">

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
            <span class="bg-white shadow-md rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
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

      <!-- Main FAB — 56 × 56 (above the 44 minimum) -->
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
import { ref, computed, reactive, inject, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFrappeAuth } from '@/composables/useFrappeAuth'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useDefaultsStore } from '@/stores/defaults'
import { api } from '@/composables/useApi'
import { useFormatters } from '@/composables/useFormatters'

const router        = useRouter()
const { userInfo }  = useFrappeAuth()
const defaultsStore = useDefaultsStore()
const scrollEl      = inject('scrollEl')
const { fmtDate }   = useFormatters()

// ── Pull-to-refresh ───────────────────────────────────────────────────────────
const { pullRatio, refreshing } = usePullToRefresh(scrollEl, () => loadDashboard(true))

// ── UI state ──────────────────────────────────────────────────────────────────
const loading     = ref(false)
const firstLoaded = ref(false)
const activity    = ref([])

const stats = reactive({
  todayQCount:  0,
  todayQValue:  0,
  openSOCount:  0,
  openSOValue:  0,
  pendingDNs:   0,
  monthlyRev:   0,
  overdueCount: 0,
  overdueValue: 0,
})

// ── Notification badge ────────────────────────────────────────────────────────
const unreadNotifications = ref(0)

async function fetchUnreadCount() {
  try {
    const result = await api.call('slate.api.notifications.get_unread_count', {})
    unreadNotifications.value = result ?? 0
  } catch { /* non-critical */ }
}

function handleVisibilityChange() {
  if (!document.hidden) fetchUnreadCount()
}

// ── FAB ───────────────────────────────────────────────────────────────────────
const fabOpen    = ref(false)
const fabActions = [
  {
    label:    'New Quotation',
    route:    { name: 'QuotationNew' },
    color:    'bg-primary',
    iconPath: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  },
  {
    label:    'New Sales Order',
    route:    { name: 'OrderNew' },
    color:    'bg-amber-500',
    iconPath: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  },
  {
    label:    'New Customer',
    route:    { name: 'CustomerNew' },
    color:    'bg-accent',
    iconPath: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>',
  },
]

// ── Derived identity ──────────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = userInfo.value?.full_name || 'there'
  return name.split(' ')[0]
})

const initials = computed(() => {
  const name = userInfo.value?.full_name || '?'
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

// ── Priority computed ─────────────────────────────────────────────────────────
const hasPriority = computed(() => stats.overdueCount > 0 || stats.pendingDNs > 0)

const priorityCount = computed(() => {
  let n = 0
  if (stats.overdueCount > 0) n++
  if (stats.pendingDNs > 0)   n++
  return n
})

// ── Data fetching ─────────────────────────────────────────────────────────────
const ACT_FIELDS    = ['name', 'customer_name', 'transaction_date', 'grand_total', 'modified', 'status', 'docstatus']
const ACT_DN_FIELDS = ['name', 'customer_name', 'posting_date',    'grand_total', 'modified', 'status', 'docstatus']
const ACT_SI_FIELDS = ['name', 'customer_name', 'posting_date',    'grand_total', 'modified', 'status', 'docstatus', 'outstanding_amount', 'is_return']

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

    const [qToday, soOpen, dnPending, soMonth, actQ, actSO, actDN, actSI, overdueInv] =
      await Promise.allSettled([
        // Stat queries
        api.getList('Quotation',     { fields: ['name', 'grand_total'], filters: [['transaction_date', '=', today], ['docstatus', '!=', 2]], limit: 500 }),
        api.getList('Sales Order',   { fields: ['name', 'grand_total'], filters: [['docstatus', '=', 1], ['status', 'in', ['To Deliver and Bill', 'To Bill', 'To Deliver']]], limit: 500 }),
        api.getList('Delivery Note', { fields: ['name'],               filters: [['docstatus', '=', 1], ['status', '=', 'To Bill']], limit: 999 }),
        api.getList('Sales Order',   { fields: ['name', 'grand_total'], filters: [['transaction_date', 'between', [firstOfMonth, today]], ['docstatus', '=', 1]], limit: 500 }),
        // Activity queries (4 each, merged + sorted to 10)
        api.getList('Quotation',     { fields: ACT_FIELDS,    limit: 4, orderBy: 'modified desc' }),
        api.getList('Sales Order',   { fields: ACT_FIELDS,    limit: 4, orderBy: 'modified desc' }),
        api.getList('Delivery Note', { fields: ACT_DN_FIELDS, limit: 4, orderBy: 'modified desc' }),
        api.getList('Sales Invoice', { fields: ACT_SI_FIELDS, limit: 4, orderBy: 'modified desc' }),
        // Priority: overdue invoices
        api.getList('Sales Invoice', { fields: ['name', 'outstanding_amount'], filters: [['docstatus', '=', 1], ['outstanding_amount', '>', 0], ['due_date', '<', today]], limit: 200 }),
      ])

    // Stats
    const qT  = unwrap(qToday)
    const soO = unwrap(soOpen)
    const dnP = unwrap(dnPending)
    const soM = unwrap(soMonth)
    const ovr = unwrap(overdueInv)

    stats.todayQCount  = qT.length
    stats.todayQValue  = qT.reduce((s, r) => s + (r.grand_total || 0), 0)
    stats.openSOCount  = soO.length
    stats.openSOValue  = soO.reduce((s, r) => s + (r.grand_total || 0), 0)
    stats.pendingDNs   = dnP.length
    stats.monthlyRev   = soM.reduce((s, r) => s + (r.grand_total || 0), 0)
    stats.overdueCount = ovr.length
    stats.overdueValue = ovr.reduce((s, r) => s + (r.outstanding_amount || 0), 0)

    // Activity — merge 4 types, sort by modified, keep top 10
    activity.value = [
      ...unwrap(actQ).map((r)  => ({ ...r, _type: 'Quotation' })),
      ...unwrap(actSO).map((r) => ({ ...r, _type: 'Sales Order' })),
      ...unwrap(actDN).map((r) => ({ ...r, _type: 'Delivery Note',  transaction_date: r.posting_date })),
      ...unwrap(actSI).map((r) => ({ ...r, _type: 'Sales Invoice',  transaction_date: r.posting_date })),
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
    'Sales Invoice': 'InvoiceDetail',
  }
  const name = routeMap[item._type]
  if (name) router.push({ name, params: { name: item.name } })
}

// ── Display helpers ───────────────────────────────────────────────────────────
function typeIconBg(type) {
  return {
    Quotation:       'bg-primary/10 text-primary',
    'Sales Order':   'bg-amber-50 text-amber-600',
    'Delivery Note': 'bg-blue-50 text-blue-600',
    'Sales Invoice': 'bg-indigo-50 text-indigo-600',
  }[type] ?? 'bg-gray-100 text-gray-500'
}

function typeDotClass(type) {
  return {
    Quotation:       'bg-primary',
    'Sales Order':   'bg-amber-500',
    'Delivery Note': 'bg-blue-500',
    'Sales Invoice': 'bg-indigo-500',
  }[type] ?? 'bg-gray-400'
}

function activityLabel(item) {
  if (item.docstatus === 2) return 'Cancelled'
  if (item.docstatus === 0) return 'Draft'
  if (item._type === 'Sales Invoice') {
    if (item.is_return)              return 'Credit Note'
    if (item.outstanding_amount > 0) return 'Unpaid'
    return 'Paid'
  }
  return item.status || 'Open'
}

function activityBadge(item) {
  if (item.docstatus === 2) return 'bg-gray-100 text-gray-500'
  if (item.docstatus === 0) return 'bg-gray-100 text-gray-600'
  if (item._type === 'Sales Invoice') {
    if (item.is_return)              return 'bg-purple-50 text-purple-700'
    if (item.outstanding_amount > 0) return 'bg-amber-50 text-amber-700'
    return 'bg-green-50 text-green-700'
  }
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
  if (diff < 60_000)      return 'now'
  if (diff < 3_600_000)   return `${Math.floor(diff / 60_000)}m`
  if (diff < 86_400_000)  return `${Math.floor(diff / 3_600_000)}h`
  if (diff < 172_800_000) return 'Yesterday'
  return fmtDate(modified)
}

function fmtHeroDate() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Compact number for stat chips and activity amounts
function compactNum(n) {
  const v = Math.abs(n ?? 0)
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${Math.round(v / 1_000)}K`
  return String(Math.round(v))
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  loadDashboard()
  fetchUnreadCount()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
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
