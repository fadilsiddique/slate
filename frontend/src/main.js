import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setConfig, frappeRequest, resourcesPlugin } from 'frappe-ui'
import FrappePushNotification from '../public/frappe-push-notification.js'

import App from './App.vue'
import router from './router/index.js'

// Configure frappe-ui to use frappeRequest as the resource fetcher
setConfig('resourceFetcher', frappeRequest)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(resourcesPlugin)

app.mount('#app')

// ─── Service Worker + Push Notifications ────────────────────────────────────
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  // The Slate PWA is a standalone SPA — window.frappe is never loaded by
  // the Frappe desk boot session. FrappePushNotification reads the relay URL
  // from window.frappe.boot.push_relay_server_url, so we fetch it from our
  // own backend and populate that path before instantiating the class.
  try {
    const resp = await fetch('/api/method/slate.api.notifications.get_push_config', {
      credentials: 'same-origin',
      headers: { 'X-Frappe-CSRF-Token': 'fetch' },
    })
    if (resp.ok) {
      const json = await resp.json()
      const relayUrl = json?.message?.push_relay_server_url
      if (relayUrl) {
        window.frappe = window.frappe || {}
        window.frappe.boot = window.frappe.boot || {}
        window.frappe.boot.push_relay_server_url = relayUrl
      }
    }
  } catch {
    // Not logged in yet or endpoint unavailable — push init will be skipped
  }

  window.frappePushNotification = new FrappePushNotification('slate')

  // Determine the correct SW URL (production vs dev)
  const isProd = import.meta.env.PROD
  const swBase = isProd ? '/assets/slate/frontend/sw.js' : '/sw.js'

  let swURL = swBase
  let config = null

  // Try to fetch FCM config from relay server (optional — push still works without it)
  try {
    config = await window.frappePushNotification.fetchWebConfig()
    swURL = `${swBase}?config=${encodeURIComponent(JSON.stringify(config))}`
  } catch (err) {
    console.warn('[SalesHub] Push relay not configured — push notifications unavailable:', err.message)
  }

  try {
    const registration = await navigator.serviceWorker.register(swURL, { type: 'classic' })

    // Show update prompt when a new SW version is waiting
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (confirm('A new version of SalesHub is available. Update now?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' })
            window.location.reload()
          }
        }
      })
    })

    console.log('[SalesHub] Service worker registered')

    // Initialize push notification (only when relay config was fetched successfully)
    if (config) {
      await window.frappePushNotification.initialize(registration)
      console.log('[SalesHub] Push notification initialized')
    }
  } catch (err) {
    console.error('[SalesHub] Service worker registration failed', err)
  }
}

registerServiceWorker()
