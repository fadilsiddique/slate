import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EV_SESSION_EXPIRED } from '@/composables/useApi'

// ── Route definitions ─────────────────────────────────────────────────────────
const routes = [
  // ── Public ──────────────────────────────────────────────────────────────────
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/features/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },

  // ── Authenticated shell (AppShell is the layout, children are page slots) ──
  {
    path: '/',
    component: () => import('@/components/shared/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/features/home/HomeView.vue'),
      },
      {
        path: 'items',
        name: 'Items',
        component: () => import('@/features/items/ItemsView.vue'),
      },
      {
        path: 'items/new',
        name: 'ItemNew',
        component: () => import('@/features/items/ItemFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'items/:itemCode',
        name: 'ItemDetail',
        component: () => import('@/features/items/ItemDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'items/:itemCode/edit',
        name: 'ItemEdit',
        component: () => import('@/features/items/ItemFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/features/customers/CustomersView.vue'),
      },
      {
        path: 'customers/new',
        name: 'CustomerNew',
        component: () => import('@/features/customers/CustomerFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'customers/:name',
        name: 'CustomerDetail',
        component: () => import('@/features/customers/CustomerDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'customers/:name/edit',
        name: 'CustomerEdit',
        component: () => import('@/features/customers/CustomerFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/features/sales-orders/SalesOrdersView.vue'),
      },
      {
        path: 'orders/new',
        name: 'OrderNew',
        component: () => import('@/features/sales-orders/SalesOrderFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'orders/:name',
        name: 'OrderDetail',
        component: () => import('@/features/sales-orders/SalesOrderDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'orders/:name/edit',
        name: 'OrderEdit',
        component: () => import('@/features/sales-orders/SalesOrderFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'quotations',
        name: 'Quotations',
        component: () => import('@/features/quotations/QuotationsView.vue'),
      },
      {
        path: 'quotations/new',
        name: 'QuotationNew',
        component: () => import('@/features/quotations/QuotationFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'quotations/:name',
        name: 'QuotationDetail',
        component: () => import('@/features/quotations/QuotationDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'quotations/:name/edit',
        name: 'QuotationEdit',
        component: () => import('@/features/quotations/QuotationFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'delivery-notes',
        name: 'DeliveryNotes',
        component: () => import('@/features/delivery-notes/DeliveryNotesView.vue'),
      },
      {
        path: 'delivery-notes/new',
        name: 'DeliveryNoteNew',
        component: () => import('@/features/delivery-notes/DeliveryNoteFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'delivery-notes/:name',
        name: 'DeliveryNoteDetail',
        component: () => import('@/features/delivery-notes/DeliveryNoteDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'invoices',
        name: 'Invoices',
        component: () => import('@/features/invoices/InvoicesView.vue'),
      },
      {
        path: 'invoices/new',
        name: 'InvoiceNew',
        component: () => import('@/features/invoices/InvoiceFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'invoices/:name',
        name: 'InvoiceDetail',
        component: () => import('@/features/invoices/InvoiceDetailView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'invoices/:name/edit',
        name: 'InvoiceEdit',
        component: () => import('@/features/invoices/InvoiceFormView.vue'),
        meta: { transition: 'slide' },
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/features/notifications/NotificationsView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/features/profile/ProfileView.vue'),
      },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

// ── Router instance ───────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory('/slate'),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

// ── Navigation guard ──────────────────────────────────────────────────────────
/**
 * Strategy:
 *   1. On very first navigation, verify the session with the server.
 *      The store hydrates from localStorage so the UI can render instantly
 *      while the server call is in-flight (verifying state).
 *   2. On subsequent navigations use the cached isLoggedIn value — no
 *      extra round-trips.
 *   3. The store's fetchUser() raises EV_SESSION_EXPIRED on 401, which the
 *      listener below turns into a redirect, independent of navigation.
 */
let authInitialized = false

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authInitialized) {
    // If we already have a cached user, don't block render — verify in bg.
    if (authStore.isLoggedIn) {
      authStore.fetchUser().catch(() => {/* handled by EV_SESSION_EXPIRED */})
    } else {
      // No cache — must wait for the server before deciding where to send them.
      await authStore.fetchUser()
    }
    authInitialized = true
  }

  const needsAuth = to.matched.some((r) => r.meta.requiresAuth !== false)

  // Unauthenticated → redirect to login, preserving the intended route
  if (needsAuth && !authStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  // Already logged in → skip the login page
  if (to.name === 'Login' && authStore.isLoggedIn) {
    const target = String(to.query.redirect ?? '/')
    return target.startsWith('/') ? target : '/'
  }
})

// ── Session-expired handler ───────────────────────────────────────────────────
// Fires when apiFetch receives a 401 — even outside of a navigation.
// Clears local state and sends the user to login with an expiry reason.
window.addEventListener(EV_SESSION_EXPIRED, () => {
  const authStore = useAuthStore()
  authStore.clearSession()
  authInitialized = false // Force re-verification next time

  const currentName = router.currentRoute.value.name
  if (currentName !== 'Login') {
    const redirect = router.currentRoute.value.fullPath
    router.push({
      name: 'Login',
      query: {
        redirect: redirect !== '/login' ? redirect : undefined,
        reason: 'expired',
      },
    })
  }
})

export default router
