<template>
  <nav
    class="bg-white border-t border-muted/30 flex items-stretch"
    style="padding-bottom: env(safe-area-inset-bottom); min-height: 4rem;"
  >
    <!-- Direct-navigation tabs -->
    <button
      v-for="item in navItems"
      :key="item.to"
      class="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
      :class="isActive(item) ? 'text-primary' : 'text-muted'"
      @click="router.push(item.to)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-[22px] h-[22px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="isActive(item) ? 2.5 : 1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        v-html="item.icon"
      />
      <span class="text-[10px] font-medium leading-none">{{ item.label }}</span>
    </button>

    <!-- More tab -->
    <button
      class="flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors"
      :class="isMoreActive() ? 'text-primary' : 'text-muted'"
      @click="moreOpen = true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-[22px] h-[22px] shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="isMoreActive() ? 2.5 : 1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span class="text-[10px] font-medium leading-none">More</span>
    </button>
  </nav>

  <!-- More bottom sheet — fixed to escape AppShell's z-20 stacking context -->
  <Transition name="sheet">
    <div
      v-if="moreOpen"
      class="fixed inset-0 z-50 flex flex-col justify-end"
      style="max-width: 480px; margin-inline: auto;"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40" @click="moreOpen = false" />

      <!-- Sheet card -->
      <div
        class="relative bg-white rounded-t-2xl shadow-2xl"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <!-- Drag pill -->
        <div class="w-10 h-1 bg-muted/30 rounded-full mx-auto mt-3 mb-4" />

        <!-- Customers -->
        <button
          class="w-full flex items-center gap-3 px-5 py-3 min-h-[44px] active:bg-surface transition-colors"
          @click="navigateFromMore('/customers')"
        >
          <div class="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-800">Customers</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Items -->
        <button
          class="w-full flex items-center gap-3 px-5 py-3 min-h-[44px] active:bg-surface transition-colors"
          @click="navigateFromMore('/items')"
        >
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-800">Items</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Delivery Notes -->
        <button
          class="w-full flex items-center gap-3 px-5 py-3 min-h-[44px] active:bg-surface transition-colors"
          @click="navigateFromMore('/delivery-notes')"
        >
          <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-800">Delivery Notes</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Profile -->
        <button
          class="w-full flex items-center gap-3 px-5 py-3 min-h-[44px] active:bg-surface transition-colors"
          @click="navigateFromMore('/profile')"
        >
          <div class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span class="text-sm font-medium text-gray-800">Profile</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <!-- Cancel -->
        <div class="px-5 mt-2 mb-4">
          <button
            class="w-full py-3 rounded-xl bg-surface text-sm font-semibold text-gray-600 active:bg-muted/20 transition-colors"
            @click="moreOpen = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const moreOpen = ref(false)

const navItems = [
  {
    to:    '/',
    label: 'Home',
    icon:  '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    to:    '/quotations',
    label: 'Quotations',
    icon:  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  },
  {
    to:    '/orders',
    label: 'Orders',
    icon:  '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  },
  {
    to:    '/invoices',
    label: 'Invoices',
    icon:  '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  },
]

const moreRoutes = ['/customers', '/items', '/delivery-notes', '/profile']

function isActive(item) {
  if (item.to === '/') return route.path === '/'
  return route.path.startsWith(item.to)
}

function isMoreActive() {
  return moreRoutes.some(r => route.path.startsWith(r))
}

function navigateFromMore(to) {
  moreOpen.value = false
  router.push(to)
}
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
