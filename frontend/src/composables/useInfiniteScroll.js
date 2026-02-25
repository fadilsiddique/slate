import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Sets up an IntersectionObserver on a sentinel element.
 * Calls `loadMore` when the sentinel becomes visible and `canLoad` is true.
 *
 * @param {() => boolean} canLoad - reactive getter; skip if false
 * @param {() => void}    loadMore - function to call when threshold is crossed
 * @returns {{ sentinel: Ref<Element|null> }}
 */
export function useInfiniteScroll(canLoad, loadMore) {
  const sentinel = ref(null)
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && canLoad()) loadMore() },
      { rootMargin: '150px' },
    )
    if (sentinel.value) observer.observe(sentinel.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { sentinel }
}
