import './index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setConfig, frappeRequest, resourcesPlugin } from 'frappe-ui'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router/index.js'

// Register service worker with auto-update prompt
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version of SalesHub is available. Update now?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('[SalesHub] App ready for offline use')
  },
})

// Configure frappe-ui to use frappeRequest as the resource fetcher
setConfig('resourceFetcher', frappeRequest)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(resourcesPlugin)

app.mount('#app')
