<template>
  <div class="flex flex-col min-h-full">

    <!-- ── Pull-to-refresh indicator ─────────────────────────────────────── -->
    <PullToRefreshIndicator :pull-ratio="pullRatio" :refreshing="refreshing" />

    <!-- ── Sticky header ──────────────────────────────────────────────────── -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm">
      <div class="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h1 class="text-xl font-bold text-gray-900 leading-tight">Notifications</h1>
          <p v-if="!loading && unreadCount > 0" class="text-xs text-muted mt-0.5">
            {{ unreadCount }} unread
          </p>
        </div>
        <button
          v-if="items.length > 0 && unreadCount > 0"
          class="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-primary/10 active:bg-primary/20 transition-colors"
          :class="markingRead ? 'opacity-50 pointer-events-none' : ''"
          @click="handleMarkAllRead"
        >
          {{ markingRead ? 'Marking…' : 'Mark all read' }}
        </button>
      </div>
    </header>

    <!-- ── Content area ───────────────────────────────────────────────────── -->
    <div class="flex-1 px-4 py-3">

      <!-- Skeleton -->
      <template v-if="loading && items.length === 0">
        <div class="space-y-2">
          <div v-for="n in 5" :key="n" class="bg-white rounded-2xl h-[72px] animate-pulse border border-muted/20" />
        </div>
      </template>

      <!-- Error -->
      <ErrorState
        v-else-if="error"
        title="Couldn't load notifications"
        :message="error"
        @retry="reload(true)"
      />

      <!-- Empty -->
      <EmptyState
        v-else-if="!loading && items.length === 0"
        title="No notifications yet"
        subtitle="You'll see alerts here when something needs your attention"
        :show-clear="false"
      >
        <template #icon>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </template>
      </EmptyState>

      <!-- List -->
      <div v-else class="space-y-2">
        <button
          v-for="item in items"
          :key="item.name"
          class="w-full bg-white rounded-2xl px-4 py-3 border border-muted/20 shadow-sm flex items-start gap-3 text-left active:scale-[.98] transition-transform"
          @click="handleTap(item)"
        >
          <!-- Unread indicator dot -->
          <div class="mt-1.5 shrink-0">
            <div
              class="w-2 h-2 rounded-full transition-colors"
              :class="item.read ? 'bg-transparent' : 'bg-primary'"
            />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p
              class="text-sm leading-snug"
              :class="item.read ? 'text-gray-500 font-normal' : 'text-gray-900 font-semibold'"
            >
              {{ item.subject }}
            </p>
            <p v-if="item.document_type" class="text-[11px] text-muted mt-0.5">
              {{ item.document_type }}
              <span v-if="item.document_name"> · {{ item.document_name }}</span>
            </p>
          </div>

          <!-- Time -->
          <span class="text-[10px] text-muted/70 shrink-0 mt-0.5">
            {{ relativeTime(item.creation) }}
          </span>
        </button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinel" class="h-px mt-1" />

      <!-- Loading more -->
      <div v-if="loading && items.length > 0" class="flex justify-center py-6">
        <svg class="w-5 h-5 animate-spin text-primary/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- End -->
      <p v-if="!hasMore && items.length > 0 && !loading" class="text-center text-xs text-muted/60 py-5">
        — {{ items.length }} notification{{ items.length !== 1 ? 's' : '' }} shown —
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFrappeAuth } from '@/composables/useFrappeAuth'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { api } from '@/composables/useApi'
import PullToRefreshIndicator from '@/components/shared/PullToRefreshIndicator.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const router   = useRouter()
const scrollEl = inject('scrollEl')
const { user } = useFrappeAuth()

const PAGE_SIZE = 30

const items     = ref([])
const loading   = ref(false)
const error     = ref(null)
const hasMore   = ref(false)
const nextStart = ref(0)
const markingRead = ref(false)

const unreadCount = computed(() => items.value.filter(n => !n.read).length)

const { pullRatio, refreshing } = usePullToRefresh(scrollEl, () => reload(true))
const { sentinel } = useInfiniteScroll(
  () => hasMore.value && !loading.value,
  loadMore,
)

// ── Data loading ──────────────────────────────────────────────────────────────
async function reload(force = false) {
  loading.value   = true
  error.value     = null
  items.value     = []
  nextStart.value = 0

  try {
    const res = await fetchNotifications(0)
    items.value     = res.data
    hasMore.value   = res.hasMore
    nextStart.value = res.data.length
  } catch (e) {
    console.error('[Notifications] reload failed', e)
    error.value = e?.message ?? 'Failed to load notifications'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await fetchNotifications(nextStart.value)
    items.value     = [...items.value, ...res.data]
    hasMore.value   = res.hasMore
    nextStart.value = items.value.length
  } catch (e) {
    console.error('[Notifications] loadMore failed', e)
  } finally {
    loading.value = false
  }
}

async function fetchNotifications(start) {
  const result = await api.getList('Notification Log', {
    fields: ['name', 'subject', 'email_content', 'read', 'creation', 'document_type', 'document_name'],
    filters: [['for_user', '=', user.value]],
    orderBy: 'creation desc',
    limit: PAGE_SIZE + 1,
    start,
  })
  const rows = result?.data ?? result ?? []
  const hasMore = rows.length > PAGE_SIZE
  return { data: hasMore ? rows.slice(0, PAGE_SIZE) : rows, hasMore }
}

// ── Actions ───────────────────────────────────────────────────────────────────
async function handleMarkAllRead() {
  markingRead.value = true
  try {
    await api.call('slate.api.notifications.mark_all_read', {})
    items.value = items.value.map(n => ({ ...n, read: 1 }))
  } catch (e) {
    console.error('[Notifications] mark all read failed', e)
  } finally {
    markingRead.value = false
  }
}

async function handleTap(item) {
  // Mark as read
  if (!item.read) {
    item.read = 1
    api.call('frappe.client.set_value', {
      doctype: 'Notification Log', name: item.name, fieldname: 'read', value: 1,
    }).catch(() => {})
  }

  // Navigate to referenced doc if we can route to it
  const routeMap = {
    Quotation:      { name: 'QuotationDetail' },
    'Sales Order':  { name: 'OrderDetail' },
    'Delivery Note':{ name: 'DeliveryNoteDetail' },
    'Sales Invoice':{ name: 'InvoiceDetail' },
  }
  if (item.document_type && item.document_name && routeMap[item.document_type]) {
    router.push({ ...routeMap[item.document_type], params: { name: item.document_name } })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts)
  if (diff < 60_000)       return 'Just now'
  if (diff < 3_600_000)    return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000)   return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 172_800_000)  return 'Yesterday'
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

onMounted(() => reload())
</script>
