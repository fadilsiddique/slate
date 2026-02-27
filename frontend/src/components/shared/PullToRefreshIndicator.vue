<template>
  <div
    class="flex items-center justify-center overflow-hidden bg-surface transition-all duration-200"
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
</template>

<script setup>
defineProps({
  pullRatio:  { type: Number, default: 0 },
  refreshing: { type: Boolean, default: false },
})
</script>
