<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <slot name="icon" />
      </svg>
    </div>
    <p class="text-gray-700 font-semibold">{{ title }}</p>
    <p class="text-muted text-sm mt-1">{{ subtitle }}</p>
    <button
      v-if="showClear"
      class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
      @click="$emit('clear')"
    >Clear filters</button>
  </div>
</template>

<script setup>
defineProps({
  title:     { type: String, default: 'Nothing found' },
  subtitle:  { type: String, default: '' },
  showClear: { type: Boolean, default: false },
})
defineEmits(['clear'])
</script>
