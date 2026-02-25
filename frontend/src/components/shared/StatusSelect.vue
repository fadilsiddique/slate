<template>
  <div class="relative flex-1">
    <select
      :value="modelValue"
      class="w-full appearance-none bg-surface border border-muted/25 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 outline-none pr-7"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="s in options" :key="s" :value="s === 'All' ? '' : s">
        {{ s === 'All' ? 'All Statuses' : s }}
      </option>
    </select>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-3 h-3 text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  options:    { type: Array,  default: () => [] },
})
defineEmits(['update:modelValue'])
</script>
