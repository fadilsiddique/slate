<template>
  <!--
    Mobile-first app shell.
    On mobile: full viewport, sticky bottom nav.
    On desktop: max-w-[480px] centered with a phone-frame shadow.
  -->
  <div
    class="relative flex flex-col bg-surface overflow-hidden"
    style="
      height: 100dvh;
      max-width: 480px;
      margin-inline: auto;
      box-shadow: 0 0 0 1px #BBBDBC40, 0 4px 40px rgba(36,95,115,.12);
    "
  >
    <!-- ── Offline indicator bar ─────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="isOffline"
        class="flex items-center justify-center gap-1.5 bg-accent text-white text-xs font-semibold py-1.5 z-30 shrink-0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        Offline — changes will sync when connection returns
        <span
          v-if="pendingSync > 0"
          class="bg-white text-accent rounded-full px-1.5 font-bold leading-tight text-[10px]"
        >
          {{ pendingSync }}
        </span>
      </div>
    </Transition>

    <!-- ── Session expired toast ─────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="showExpiredToast"
        class="flex items-center justify-between gap-2 bg-red-500 text-white text-xs font-semibold px-4 py-2 z-30 shrink-0"
      >
        <span>Session expired — please sign in again</span>
        <button class="underline opacity-80 hover:opacity-100" @click="showExpiredToast = false">
          Dismiss
        </button>
      </div>
    </Transition>

    <!-- ── Scrollable content ────────────────────────────────────────────── -->
    <main ref="mainRef" class="flex-1 overflow-y-auto overscroll-contain" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom))">
      <router-view v-slot="{ Component, route }">
        <Transition :name="route.meta.transition ?? 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>

    <!-- ── Bottom navigation ─────────────────────────────────────────────── -->
    <div class="absolute bottom-0 left-0 right-0 z-20">
      <BottomNav />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import BottomNav from './BottomNav.vue'
import { EV_SESSION_EXPIRED, EV_QUEUE_CHANGED } from '@/composables/useApi'

// Provide the scroll container so child views can attach touch-based
// pull-to-refresh listeners without querying the DOM.
const mainRef = ref(null)
provide('scrollEl', mainRef)

// ── Offline state ─────────────────────────────────────────────────────────────
const isOffline = ref(!navigator.onLine)
const pendingSync = ref(0)

function handleOnline()  { isOffline.value = false }
function handleOffline() { isOffline.value = true }
function handleQueueChange(e) { pendingSync.value = e.detail.count }

// ── Session expiry toast ──────────────────────────────────────────────────────
const showExpiredToast = ref(false)

function handleSessionExpired() {
  // The router will navigate to /login; show a brief toast while the
  // transition plays so the user understands why they were redirected.
  showExpiredToast.value = true
  setTimeout(() => { showExpiredToast.value = false }, 5000)
}

onMounted(() => {
  window.addEventListener('online',  handleOnline)
  window.addEventListener('offline', handleOffline)
  window.addEventListener(EV_QUEUE_CHANGED, handleQueueChange)
  window.addEventListener(EV_SESSION_EXPIRED, handleSessionExpired)
})

onUnmounted(() => {
  window.removeEventListener('online',  handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener(EV_QUEUE_CHANGED, handleQueueChange)
  window.removeEventListener(EV_SESSION_EXPIRED, handleSessionExpired)
})
</script>

<style scoped>
/* Slide banner in from top */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease;
  overflow: hidden;
  max-height: 3rem;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Page cross-fade (default) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition — opt-in via route.meta.transition = 'slide' */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from  { transform: translateX(100%); }
.slide-leave-to    { transform: translateX(-30%); }
</style>
