<template>
  <span
    class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
    :class="colorClass"
  >{{ label }}</span>
</template>

<script setup>
defineProps({
  label:      { type: String, default: '' },
  colorClass: { type: String, default: 'bg-gray-100 text-gray-600' },
})
</script>
