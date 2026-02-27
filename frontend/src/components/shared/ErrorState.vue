<template>
  <div class="flex flex-col items-center justify-center py-20 text-center px-6">
    <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <p class="text-gray-700 font-semibold">{{ title }}</p>
    <p class="text-red-400 text-xs mt-1 break-all">{{ message }}</p>
    <button
      class="mt-4 px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
      @click="$emit('retry')"
    >{{ retryLabel }}</button>
  </div>
</template>

<script setup>
defineProps({
  title:       { type: String, default: 'Something went wrong' },
  message:     { type: String, default: '' },
  retryLabel:  { type: String, default: 'Try again' },
})
defineEmits(['retry'])
</script>
