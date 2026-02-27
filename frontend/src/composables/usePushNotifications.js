import { ref, onMounted } from 'vue'

export function usePushNotifications() {
  const enabled   = ref(false)
  const supported = ref(false)
  const loading   = ref(false)
  const error     = ref(null)

  onMounted(async () => {
    supported.value = 'Notification' in window && 'serviceWorker' in navigator
    if (!supported.value) return
    const pn = window.frappePushNotification
    if (pn) enabled.value = pn.isNotificationEnabled()
  })

  async function toggle() {
    const pn = window.frappePushNotification
    if (!pn) { error.value = 'Push notifications not initialized'; return }
    loading.value = true
    error.value   = null
    try {
      if (enabled.value) {
        await pn.disableNotification()
        enabled.value = false
      } else {
        const result = await pn.enableNotification()
        if (!result.permission_granted) {
          error.value = 'Permission denied — please allow notifications in your browser settings'
        } else {
          enabled.value = true
        }
      }
    } catch (e) {
      error.value = e?.message ?? 'Failed to toggle push notifications'
    } finally {
      loading.value = false
    }
  }

  return { enabled, supported, loading, error, toggle }
}
