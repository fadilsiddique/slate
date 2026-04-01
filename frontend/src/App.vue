<template>
  <router-view />

  <!-- ── PWA Install Prompt ─────────────────────────────────────────────── -->
  <Transition name="slide-up">
    <div
      v-if="showInstallPrompt"
      class="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style="max-width: 480px; margin-inline: auto;"
    >
      <div
        class="w-full bg-white border-t border-muted/20 shadow-2xl pointer-events-auto"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- App icon -->
          <img src="/assets/slate/frontend/icons/icon-192.png" class="w-11 h-11 rounded-2xl shrink-0" alt="" />

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900 leading-tight">Add SalesHub to Home Screen</p>
            <p class="text-[11px] text-muted mt-0.5">Works offline · Faster · No browser UI</p>
          </div>

          <!-- Dismiss -->
          <button
            class="w-7 h-7 flex items-center justify-center rounded-full bg-surface text-muted shrink-0"
            @click="dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Install button -->
        <div class="px-4 pb-3">
          <button
            class="w-full min-h-[44px] bg-primary text-white text-sm font-semibold rounded-xl active:scale-[.98] transition-transform"
            @click="install"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const DISMISSED_KEY = 'slate:install-prompt-dismissed'

const showInstallPrompt = ref(false)
let deferredPrompt = null

function handleBeforeInstallPrompt(e) {
  // Only show if user hasn't permanently dismissed
  if (localStorage.getItem(DISMISSED_KEY)) return
  e.preventDefault()
  deferredPrompt = e
  showInstallPrompt.value = true
}

async function install() {
  if (!deferredPrompt) return
  showInstallPrompt.value = false
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    deferredPrompt = null
  }
}

function dismiss() {
  showInstallPrompt.value = false
  // Don't show again for 30 days
  localStorage.setItem(DISMISSED_KEY, Date.now() + 30 * 24 * 60 * 60 * 1000)
}

onMounted(() => {
  // Clear expired dismissals
  const until = parseInt(localStorage.getItem(DISMISSED_KEY) || '0')
  if (until && Date.now() > until) localStorage.removeItem(DISMISSED_KEY)

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
