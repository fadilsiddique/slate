/**
 * usePullToRefresh
 *
 * Attaches touch listeners to the provided scroll element ref and triggers
 * a refresh callback when the user pulls down past the threshold.
 *
 * Usage:
 *   const scrollEl = inject('scrollEl')
 *   const { pulling, pullRatio, refreshing } = usePullToRefresh(scrollEl, onRefresh)
 *
 *   <!-- In template, show indicator when pulling or refreshing -->
 *   <div :style="{ height: `${pullRatio * 56}px`, opacity: pullRatio }" />
 */

import { ref, watch, onUnmounted } from 'vue'

const THRESHOLD = 72   // px — pull distance to trigger refresh
const MAX_PULL  = 110  // px — clamp so the indicator doesn't go too far

export function usePullToRefresh(scrollElRef, onRefresh) {
  const pulling      = ref(false)   // user is actively dragging
  const pullDistance = ref(0)       // raw px pulled (clamped to MAX_PULL)
  const pullRatio    = ref(0)       // 0–1 progress toward threshold
  const refreshing   = ref(false)   // async refresh in flight

  let startY     = 0
  let tracking   = false

  // ── Touch handlers ──────────────────────────────────────────────────────────
  function onTouchStart(e) {
    const el = scrollElRef?.value
    if (!el || refreshing.value) return
    // Only start tracking when the scroll container is at the very top
    if (el.scrollTop > 0) return
    startY   = e.touches[0].clientY
    tracking = true
  }

  function onTouchMove(e) {
    if (!tracking) return
    const el = scrollElRef?.value
    if (!el) return

    const delta = e.touches[0].clientY - startY

    // User scrolled up — abort
    if (delta <= 0 || el.scrollTop > 0) {
      tracking = false
      pullDistance.value = 0
      pulling.value = false
      pullRatio.value = 0
      return
    }

    // Prevent the page from scrolling while we're pulling
    e.preventDefault()

    const clamped = Math.min(delta * 0.55, MAX_PULL)
    pullDistance.value = clamped
    pullRatio.value    = Math.min(clamped / THRESHOLD, 1)
    pulling.value      = clamped > 4
  }

  function onTouchEnd() {
    if (!tracking) return
    tracking = false

    if (pullDistance.value >= THRESHOLD && !refreshing.value) {
      triggerRefresh()
    }

    pullDistance.value = 0
    pullRatio.value    = 0
    pulling.value      = false
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  function attach(el) {
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: false })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
  }

  function detach(el) {
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove',  onTouchMove)
    el.removeEventListener('touchend',   onTouchEnd)
  }

  // Watch for the ref to be populated (the scroll element may mount after the composable)
  const stopWatch = watch(
    () => scrollElRef?.value,
    (newEl, oldEl) => {
      if (oldEl) detach(oldEl)
      if (newEl) attach(newEl)
    },
    { immediate: true },
  )

  onUnmounted(() => {
    stopWatch()
    const el = scrollElRef?.value
    if (el) detach(el)
  })

  // ── Trigger ─────────────────────────────────────────────────────────────────
  async function triggerRefresh() {
    refreshing.value = true
    try {
      await onRefresh()
    } finally {
      refreshing.value = false
    }
  }

  return { pulling, pullRatio, refreshing, triggerRefresh }
}
