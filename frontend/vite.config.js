import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { getProxyOptions } from 'frappe-ui/src/utils/vite-dev-server'
import { webserver_port } from '../../../sites/common_site_config.json'

export default defineConfig(({ command }) => ({
  // In dev, base stays at '/' so localhost:8080 works normally.
  // In production build, assets land under /assets/slate/frontend/ which is
  // where Frappe serves files from apps/<app>/public/frontend/.
  base: command === 'build' ? '/assets/slate/frontend/' : '/',

  plugins: [
    vue(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'SalesHub',
        short_name: 'SalesHub',
        description: 'Mobile sales hub powered by ERPNext',
        start_url: '/slate/',
        scope: '/slate/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#245F73',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['business', 'productivity'],
        shortcuts: [
          {
            name: 'New Order',
            short_name: 'Order',
            description: 'Create a new sales order',
            url: '/slate/orders',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Items',
            short_name: 'Items',
            description: 'Browse product catalog',
            url: '/slate/items',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    port: 8080,
    proxy: getProxyOptions({ port: webserver_port }),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: `../${path.basename(path.resolve('..'))}/public/frontend`,
    emptyOutDir: true,
    target: 'es2015',
    rollupOptions: {
      output: {
        // Deterministic names for the entry JS and CSS so www/slate.html can
        // reference them without knowing the content hash.
        // Async chunks keep their hashes for proper cache busting.
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) =>
          assetInfo.names?.[0]?.endsWith('.css')
            ? 'assets/index.css'
            : 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    include: ['frappe-ui > feather-icons', 'showdown', 'engine.io-client'],
  },
}))
