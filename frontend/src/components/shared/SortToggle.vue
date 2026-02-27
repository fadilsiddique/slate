<template>
  <div class="flex items-center gap-0.5 bg-surface p-0.5 rounded-lg shrink-0">
    <button
      v-for="s in options"
      :key="s.key"
      class="px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors"
      :class="modelValue === s.key ? 'bg-white shadow text-gray-800' : 'text-muted'"
      @click="$emit('update:modelValue', s.key)"
    >{{ s.label }}</button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'creation' },
  options: {
    type: Array,
    default: () => [
      { key: 'creation', label: 'Created' },
      { key: 'modified', label: 'Updated' },
    ],
  },
})
defineEmits(['update:modelValue'])
</script>
