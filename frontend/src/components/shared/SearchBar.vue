<template>
  <div class="relative">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      class="w-full pl-9 pr-9 py-2.5 text-sm bg-surface rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary transition"
      @input="onInput"
    />
    <button
      v-if="modelValue"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-600 p-0.5"
      @click="$emit('clear')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search…' },
})
const emit = defineEmits(['update:modelValue', 'input', 'clear'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
  emit('input', e.target.value)
}
</script>
