<template>
  <div class="space-y-3">

    <!-- Template selector row -->
    <div class="flex items-center gap-2">
      <div class="relative flex-1">
        <select
          v-model="selectedTemplate"
          class="w-full px-4 py-3 text-sm bg-white rounded-xl border border-muted/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition appearance-none pr-9"
          @change="onTemplateChange"
        >
          <option value="">— Select template —</option>
          <option v-for="t in templates" :key="t.name" :value="t.name">{{ t.name }}</option>
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          :class="loading ? 'animate-spin' : ''"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline v-if="!loading" points="6 9 12 15 18 9"/>
          <path v-else d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>

      <!-- Clear button -->
      <button
        v-if="modelValue"
        type="button"
        class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-colors border border-muted/30"
        title="Clear terms"
        @click="$emit('update:modelValue', '')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- HTML preview -->
    <div
      v-if="modelValue"
      class="terms-preview px-4 py-3 bg-white rounded-xl border border-muted/20 text-sm text-gray-700"
      v-html="modelValue"
    />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/composables/useApi'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const templates        = ref([])
const selectedTemplate = ref('')
const loading          = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.getList('Terms and Conditions', {
      fields: ['name'],
      limit:  50,
      orderBy: 'name asc',
    })
    templates.value = res?.data ?? res ?? []
  } catch {
    templates.value = []
  } finally {
    loading.value = false
  }
})

async function onTemplateChange() {
  if (!selectedTemplate.value) return
  loading.value = true
  try {
    const doc = await api.call('frappe.client.get', {
      doctype: 'Terms and Conditions',
      name:    selectedTemplate.value,
    })
    const terms = doc?.data?.terms ?? doc?.terms ?? ''
    emit('update:modelValue', terms)
  } catch {
    /* keep existing value */
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.terms-preview :deep(h1) { font-size: 1.125rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
.terms-preview :deep(h2) { font-size: 1rem;     font-weight: 700; margin: 0.625rem 0 0.25rem; }
.terms-preview :deep(h3),
.terms-preview :deep(h4),
.terms-preview :deep(h5),
.terms-preview :deep(h6) { font-size: 0.875rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
.terms-preview :deep(p)  { margin: 0.375rem 0; line-height: 1.6; }
.terms-preview :deep(ul),
.terms-preview :deep(ol) { padding-left: 1.25rem; margin: 0.375rem 0; }
.terms-preview :deep(li) { margin: 0.25rem 0; }
.terms-preview :deep(ul) { list-style-type: disc; }
.terms-preview :deep(ol) { list-style-type: decimal; }
.terms-preview :deep(strong) { font-weight: 600; }
.terms-preview :deep(em) { font-style: italic; }
.terms-preview :deep(a)  { color: #245F73; text-decoration: underline; }
.terms-preview :deep(hr) { border: none; border-top: 1px solid #e5e7eb; margin: 0.75rem 0; }
</style>
