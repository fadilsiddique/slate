<template>
  <div class="flex flex-col min-h-full bg-surface">

    <!-- Header -->
    <header class="bg-white sticky top-0 z-10 border-b border-muted/20 shadow-sm px-4 pt-4 pb-3">
      <h1 class="text-xl font-bold text-gray-900 leading-tight">Profile</h1>
    </header>

    <!-- User card -->
    <div class="px-4 pt-4 space-y-3">
      <div class="bg-white rounded-2xl px-4 py-4 border border-muted/20 shadow-sm flex items-center gap-4">
        <!-- Avatar -->
        <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
          <img v-if="userInfo?.user_image" :src="userInfo.user_image" class="w-full h-full object-cover" />
          <span v-else class="text-primary font-bold text-xl">{{ initials }}</span>
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-gray-900 truncate">{{ userInfo?.full_name || user || '—' }}</p>
          <p class="text-xs text-muted truncate mt-0.5">{{ user }}</p>
        </div>
      </div>

      <!-- Logout button -->
      <button
        class="w-full bg-white rounded-2xl px-4 py-3.5 border border-muted/20 shadow-sm flex items-center gap-3 text-left active:scale-[.98] transition-transform"
        :class="loggingOut ? 'opacity-60 pointer-events-none' : ''"
        @click="handleLogout"
      >
        <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <span class="text-sm font-semibold text-red-600 flex-1">
          {{ loggingOut ? 'Signing out…' : 'Sign Out' }}
        </span>
        <svg v-if="loggingOut" class="w-4 h-4 animate-spin text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFrappeAuth } from '@/composables/useFrappeAuth'

const { user, userInfo, logout } = useFrappeAuth()
const loggingOut = ref(false)

const initials = computed(() => {
  const name = userInfo.value?.full_name || user.value || ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
  } finally {
    loggingOut.value = false
  }
}
</script>
