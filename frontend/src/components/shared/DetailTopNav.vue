<template>
  <div class="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-sm border-b border-muted/20">
    <button
      class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0"
      @click="$emit('back')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <slot />
  </div>
</template>

<script setup>
defineEmits(['back'])
</script>
