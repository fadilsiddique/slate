import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

/**
 * useFrappeAuth — thin component-facing wrapper over the Pinia auth store.
 *
 * Keeps the store's internal shape decoupled from the component API, and
 * adds router-aware login/logout navigation so views don't need useRouter.
 */
export function useFrappeAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const { user, userInfo, loading, verifying, isLoggedIn } = storeToRefs(authStore)

  async function login(usr, pwd) {
    await authStore.login(usr, pwd)
    // After a successful login the auth store has already called fetchUser().
    // Redirect to the originally requested page (set by the router guard)
    // or fall back to home.
    const redirect = router.currentRoute.value.query.redirect
    const target = redirect && String(redirect).startsWith('/') ? String(redirect) : '/'
    router.push(target)
  }

  async function logout() {
    await authStore.logout()
    router.push({ name: 'Login' })
  }

  return {
    user,
    userInfo,
    loading,
    verifying,
    isLoggedIn,
    login,
    logout,
    fetchUser: authStore.fetchUser,
  }
}
