<template>
  <!-- Share icon button -->
  <button
    class="w-8 h-8 rounded-xl border border-muted/30 flex items-center justify-center shrink-0 transition-opacity"
    :class="sharing ? 'opacity-50 pointer-events-none' : ''"
    @click="handleShare"
  >
    <svg v-if="sharing" class="w-4 h-4 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  </button>

  <!-- Fallback bottom sheet — teleported to body to escape backdrop-filter containing block -->
  <Teleport to="body">
    <Transition name="share-sheet">
      <div
        v-if="sheetOpen"
        class="fixed inset-0 z-50 flex flex-col justify-end"
        style="max-width: 480px; margin-inline: auto;"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="sheetOpen = false" />

        <!-- Sheet -->
        <div class="relative bg-white rounded-t-3xl px-4 pt-4 pb-10 shadow-2xl">
          <!-- Drag pill -->
          <div class="w-10 h-1 bg-muted/30 rounded-full mx-auto mb-5" />
          <p class="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">Share via</p>

          <!-- WhatsApp -->
          <a
            :href="whatsappUrl()"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-3 py-3 px-3 rounded-xl active:bg-surface"
            @click="sheetOpen = false"
          >
            <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-800">WhatsApp</span>
          </a>

          <!-- Telegram -->
          <a
            :href="telegramUrl()"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-3 py-3 px-3 rounded-xl active:bg-surface"
            @click="sheetOpen = false"
          >
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#2AABEE">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-800">Telegram</span>
          </a>

          <!-- Email -->
          <a
            :href="emailUrl()"
            class="flex items-center gap-3 py-3 px-3 rounded-xl active:bg-surface"
            @click="sheetOpen = false"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-800">Email</span>
          </a>

          <!-- Download PDF -->
          <button
            class="w-full flex items-center gap-3 py-3 px-3 rounded-xl active:bg-surface"
            @click="downloadPdf"
          >
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-800">Download PDF</span>
          </button>

          <!-- Copy link -->
          <button
            class="w-full flex items-center gap-3 py-3 px-3 rounded-xl active:bg-surface"
            @click="copyLink"
          >
            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-800">Copy PDF Link</span>
          </button>

          <!-- Cancel -->
          <button
            class="w-full mt-3 py-3 rounded-xl bg-surface text-sm font-semibold text-gray-600 active:bg-muted/20"
            @click="sheetOpen = false"
          >Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/composables/useApi'

const props = defineProps({
  doctype:      { type: String, required: true },
  docName:      { type: String, required: true },
  customerName: { type: String, default: '' },
  grandTotal:   { type: Number, default: 0 },
  currency:     { type: String, default: 'AED' },
})

const emit = defineEmits(['error'])

const sharing     = ref(false)
const sheetOpen   = ref(false)
const printFormat = ref('')
const letterhead  = ref('')

// ── PDF URL ────────────────────────────────────────────────────────────────────
function pdfUrl() {
  const qs = new URLSearchParams({
    doctype:       props.doctype,
    name:          props.docName,
    no_letterhead: letterhead.value ? '0' : '1',
    settings:      '{}',
  })
  if (printFormat.value) qs.set('format', printFormat.value)
  if (letterhead.value)  qs.set('letterhead', letterhead.value)
  return `/api/method/frappe.utils.print_format.download_pdf?${qs}`
}

async function fetchPdfBlob() {
  const resp = await fetch(pdfUrl(), {
    credentials: 'same-origin',
    headers: { 'X-Frappe-CSRF-Token': window.csrf_token ?? window.frappe?.csrf_token ?? 'fetch' },
  })
  if (!resp.ok) throw new Error(`PDF generation failed (${resp.status})`)
  return resp.blob()
}

// ── Share handlers ────────────────────────────────────────────────────────────
async function handleShare() {
  sharing.value = true
  try {
    const blob = await fetchPdfBlob()
    const file = new File([blob], `${props.docName}.pdf`, { type: 'application/pdf' })

    // Tier 1: native OS share sheet with file
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: `${props.doctype} ${props.docName}`,
        text:  `${props.doctype} for ${props.customerName}`,
        files: [file],
      })
      return
    }

    // Tier 2: Web Share URL only
    if (navigator.share) {
      await navigator.share({
        title: `${props.doctype} ${props.docName}`,
        url:   window.location.origin + pdfUrl(),
      })
      return
    }

    // Tier 3: manual bottom sheet
    sheetOpen.value = true
  } catch (e) {
    if (e?.name !== 'AbortError') emit('error', e?.message ?? 'Could not share')
  } finally {
    sharing.value = false
  }
}

async function downloadPdf() {
  sheetOpen.value = false
  sharing.value = true
  try {
    const blob = await fetchPdfBlob()
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `${props.docName}.pdf` })
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    emit('error', e?.message ?? 'Download failed')
  } finally {
    sharing.value = false
  }
}

async function copyLink() {
  sheetOpen.value = false
  try {
    await navigator.clipboard.writeText(window.location.origin + pdfUrl())
  } catch {
    emit('error', 'Could not copy link')
  }
}

// ── Share URL builders ────────────────────────────────────────────────────────
function whatsappUrl() {
  const link = window.location.origin + pdfUrl()
  const text = `*${props.doctype} ${props.docName}*\nCustomer: ${props.customerName}\nAmount: ${props.currency} ${fmt(props.grandTotal)}\n\n${link}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

function telegramUrl() {
  const link = window.location.origin + pdfUrl()
  const text = `${props.doctype} ${props.docName} – ${props.customerName} – ${props.currency} ${fmt(props.grandTotal)}`
  return `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
}

function emailUrl() {
  const subject = `${props.doctype} ${props.docName}`
  const body    = `Dear ${props.customerName || 'Customer'},\n\nRef: ${props.docName}\nAmount: ${props.currency} ${fmt(props.grandTotal)}\n\nPDF: ${window.location.origin}${pdfUrl()}`
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const _fmt = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function fmt(n) { return _fmt.format(n ?? 0) }

// ── Mount: fetch print format + letterhead best-effort ────────────────────────
onMounted(async () => {
  await Promise.allSettled([
    api.call('frappe.client.get_value', {
      doctype: 'DocType', filters: { name: props.doctype }, fieldname: 'default_print_format',
    }).then(r => { if (r?.default_print_format) printFormat.value = r.default_print_format }).catch(() => {}),
    api.call('frappe.client.get_default', { key: 'Letter Head' })
      .then(r => { if (r) letterhead.value = r }).catch(() => {}),
  ])
})
</script>

<style scoped>
.share-sheet-enter-active,
.share-sheet-leave-active {
  transition: transform 0.25s ease;
}
.share-sheet-enter-from,
.share-sheet-leave-to {
  transform: translateY(100%);
}
</style>
