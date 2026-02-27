<template>
  <div class="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
    <button
      v-for="tab in tabs"
      :key="tab"
      class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap"
      :class="modelValue === (tab === 'All' ? '' : tab)
        ? activeClass(tab)
        : 'bg-white text-gray-600 border-muted/40'"
      @click="$emit('update:modelValue', tab === 'All' ? '' : tab)"
    >{{ tab }}</button>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs:       { type: Array,  required: true },
  modelValue: { type: String, default: '' },
  activeClass: { type: Function, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
