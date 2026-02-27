<template>
  <div class="bg-white rounded-2xl border border-muted/20 shadow-sm overflow-hidden">
    <div v-if="title" class="px-4 py-3 border-b border-muted/20">
      <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">{{ title }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
})
</script>
