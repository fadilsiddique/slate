<template>
  <!-- ── Trigger button ───────────────────────────────────────────────────── -->
  <button
    class="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors shrink-0 max-w-[160px]"
    :class="from || to
      ? 'border-primary bg-primary/5 text-primary'
      : 'border-muted/25 bg-surface text-gray-600'"
    @click="openCalendar"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
    <span class="truncate">{{ label }}</span>
    <span
      v-if="from || to"
      class="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
      @click.stop="clearDates"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </span>
  </button>

  <!-- ── Calendar bottom sheet ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="drp-sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex flex-col justify-end"
        style="max-width:480px;margin-inline:auto"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="open = false" />

        <!-- Sheet -->
        <div class="relative bg-white rounded-t-3xl px-4 pt-3 pb-8 shadow-2xl">
          <div class="w-10 h-1 bg-muted/30 rounded-full mx-auto mb-4" />

          <!-- Month navigation -->
          <div class="flex items-center justify-between mb-3 px-1">
            <button
              class="w-8 h-8 rounded-xl bg-surface flex items-center justify-center active:bg-muted/20"
              @click="prevMonth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span class="text-sm font-bold text-gray-900">{{ MONTH_NAMES[month] }} {{ year }}</span>
            <button
              class="w-8 h-8 rounded-xl bg-surface flex items-center justify-center active:bg-muted/20"
              @click="nextMonth"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          <!-- Weekday headers -->
          <div class="grid grid-cols-7 mb-1">
            <div
              v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']"
              :key="d"
              class="text-center text-[10px] font-semibold text-muted py-1"
            >{{ d }}</div>
          </div>

          <!-- Day grid -->
          <div class="grid grid-cols-7">
            <div v-for="(day, i) in days" :key="i" class="flex items-center justify-center py-0.5">
              <button
                v-if="day"
                class="w-9 h-9 text-sm font-medium transition-colors rounded-full flex items-center justify-center"
                :class="dayClass(day)"
                @click="selectDay(day)"
              >{{ parseInt(day.split('-')[2]) }}</button>
            </div>
          </div>

          <!-- Hint -->
          <p
            class="text-[11px] text-center mt-3 min-h-[16px]"
            :class="tempFrom && tempTo ? 'text-primary font-semibold' : 'text-muted'"
          >
            {{ !tempFrom ? 'Tap a date to set start' : !tempTo ? 'Tap a date to set end' : `${fmtDate(tempFrom)} — ${fmtDate(tempTo)}` }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 mt-4">
            <button
              class="flex-1 py-2.5 rounded-xl border border-muted/30 text-sm font-semibold text-gray-600 active:bg-surface"
              @click="clearFromSheet"
            >Clear</button>
            <button
              class="flex-[2] py-2.5 rounded-xl text-sm font-semibold transition-colors"
              :class="tempFrom ? 'bg-primary text-white active:bg-primary/90' : 'bg-muted/20 text-muted'"
              :disabled="!tempFrom"
              @click="applyDates"
            >Apply</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFormatters } from '@/composables/useFormatters'

const props = defineProps({
  from: { type: String, default: '' },
  to:   { type: String, default: '' },
})

const emit = defineEmits(['update:from', 'update:to', 'apply'])

const { fmtDate } = useFormatters()

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ── Calendar state ────────────────────────────────────────────────────────────
const open    = ref(false)
const year    = ref(new Date().getFullYear())
const month   = ref(new Date().getMonth())
const tempFrom = ref('')
const tempTo   = ref('')

// ── Computed ──────────────────────────────────────────────────────────────────
const label = computed(() => {
  if (props.from && props.to) return `${fmtDate(props.from)} – ${fmtDate(props.to)}`
  if (props.from) return `From ${fmtDate(props.from)}`
  if (props.to)   return `To ${fmtDate(props.to)}`
  return 'Date range'
})

const days = computed(() => {
  const firstDow    = new Date(year.value, month.value, 1).getDay()
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const result = Array(firstDow).fill(null)
  const y = year.value
  const m = month.value
  for (let d = 1; d <= daysInMonth; d++) {
    result.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  }
  return result
})

// ── Actions ───────────────────────────────────────────────────────────────────
function openCalendar() {
  tempFrom.value = props.from
  tempTo.value   = props.to
  const d = props.from ? new Date(props.from + 'T00:00:00') : new Date()
  year.value  = d.getFullYear()
  month.value = d.getMonth()
  open.value  = true
}

function prevMonth() {
  if (month.value === 0) { month.value = 11; year.value-- }
  else month.value--
}

function nextMonth() {
  if (month.value === 11) { month.value = 0; year.value++ }
  else month.value++
}

function selectDay(dateStr) {
  if (!tempFrom.value || (tempFrom.value && tempTo.value)) {
    tempFrom.value = dateStr
    tempTo.value   = ''
  } else if (dateStr === tempFrom.value) {
    tempFrom.value = ''
  } else if (dateStr < tempFrom.value) {
    tempTo.value   = tempFrom.value
    tempFrom.value = dateStr
  } else {
    tempTo.value = dateStr
  }
}

function dayClass(dateStr) {
  const isFrom  = dateStr === tempFrom.value
  const isTo    = dateStr === tempTo.value
  const inRange = tempFrom.value && tempTo.value
    && dateStr > tempFrom.value && dateStr < tempTo.value
  const today   = new Date().toISOString().slice(0, 10)
  if (isFrom || isTo) return 'bg-primary text-white'
  if (inRange)        return 'bg-primary/15 text-primary'
  if (dateStr === today) return 'border border-primary/40 text-primary font-semibold'
  return 'text-gray-700 hover:bg-surface'
}

function applyDates() {
  emit('update:from', tempFrom.value)
  emit('update:to',   tempTo.value)
  open.value = false
  emit('apply')
}

function clearFromSheet() {
  tempFrom.value = ''
  tempTo.value   = ''
  emit('update:from', '')
  emit('update:to',   '')
  open.value = false
  emit('apply')
}

function clearDates() {
  emit('update:from', '')
  emit('update:to',   '')
  emit('apply')
}
</script>

<style scoped>
.drp-sheet-enter-active, .drp-sheet-leave-active { transition: transform 0.25s ease; }
.drp-sheet-enter-from,   .drp-sheet-leave-to     { transform: translateY(100%); }
</style>
