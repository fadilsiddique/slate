<template>
  <div class="relative">
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      class="w-full px-4 py-3 text-sm bg-white rounded-xl border transition focus:outline-none"
      :class="error
        ? 'border-red-400 ring-1 ring-red-400'
        : 'border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary'"
      @input="$emit('update:modelValue', $event.target.value); $emit('input')"
      @focus="$emit('focus')"
      @blur="$emit('blur')"
    />
    <ul
      v-if="results.length"
      class="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-muted/30 rounded-xl shadow-lg max-h-48 overflow-y-auto"
    >
      <li
        v-for="item in results"
        :key="item.id"
        class="px-4 py-2.5 text-sm text-gray-800 hover:bg-surface cursor-pointer"
        @mousedown.prevent="$emit('select', item)"
      >
        {{ item.label }}
        <span v-if="item.sublabel" class="text-xs text-muted ml-1">({{ item.sublabel }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  modelValue:  { type: String,  default: '' },
  results:     { type: Array,   default: () => [] },
  error:       { type: Boolean, default: false },
  placeholder: { type: String,  default: 'Search…' },
})
defineEmits(['update:modelValue', 'input', 'focus', 'blur', 'select'])
</script>
