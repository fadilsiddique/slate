/**
 * SalesHub Service Worker
 * Handles precaching, runtime caching, and background sync for offline support.
 */
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'
import { createHandlerBoundToURL } from 'workbox-precaching'

// Remove caches from previous workbox versions
cleanupOutdatedCaches()

// Precache the app shell assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

// SPA fallback: serve index.html for all navigation requests
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [/^\/api\//],
  }),
)

// ─── Background Sync ────────────────────────────────────────────────────────
// Queues failed mutation requests and replays them when connectivity is restored
const bgSyncPlugin = new BackgroundSyncPlugin('saleshub-mutations', {
  maxRetentionTime: 24 * 60, // retain for up to 24 hours (in minutes)
})

// POST /api/method/* — mutations (create doc, call method, etc.)
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/method/') && request.method === 'POST',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST',
)

// PUT /api/resource/* — document updates
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/resource/') && request.method === 'PUT',
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'PUT',
)

// ─── Runtime Caching ────────────────────────────────────────────────────────
// GET /api/* — Frappe REST API (NetworkFirst: fresh data preferred, cache as fallback)
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/method/') || url.pathname.startsWith('/api/resource/'),
  new NetworkFirst({
    cacheName: 'frappe-api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      }),
    ],
  }),
)

// Fonts — CacheFirst (long-lived, rarely change)
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)

// Images — StaleWhileRevalidate (show cached, update in background)
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  }),
)

// ─── SW Lifecycle ───────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ─── Firebase Push Notifications ────────────────────────────────────────────
// Firebase config is passed as a URL query param when registering the SW.
// Wrapped in an async IIFE to avoid top-level await (not supported in es2015 target).
const jsonConfig = new URL(location).searchParams.get('config')
if (jsonConfig) {
  ;(async () => {
    try {
      const { initializeApp } = await import('firebase/app')
      const { getMessaging, onBackgroundMessage } = await import('firebase/messaging/sw')

      const firebaseApp = initializeApp(JSON.parse(jsonConfig))
      const messaging = getMessaging(firebaseApp)

      onBackgroundMessage(messaging, (payload) => {
        const title = payload?.data?.title || 'SalesHub'
        const options = {
          body: payload?.data?.body || '',
          icon: payload?.data?.notification_icon || '/assets/slate/frontend/icons/icon-192.png',
          data: { url: payload?.data?.click_action },
        }
        self.registration.showNotification(title, options)
      })

      self.addEventListener('notificationclick', (event) => {
        event.notification.close()
        const url = event.notification.data?.url
        if (url) {
          event.waitUntil(clients.openWindow(url))
        }
      })
    } catch (err) {
      console.error('[SW] Firebase push notification init failed', err)
    }
  })()
}
