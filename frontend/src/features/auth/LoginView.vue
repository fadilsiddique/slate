<template>
  <div
    class="min-h-screen flex flex-col justify-center px-6 py-10"
    style="background: linear-gradient(160deg, #1c4d5e 0%, #245F73 55%, #2d7490 100%)"
    :class="{ 'opacity-80': isOffline }"
  >
    <!-- Offline banner -->
    <Transition name="slide-down">
      <div
        v-if="isOffline"
        class="fixed top-0 left-0 right-0 bg-accent text-white text-xs font-semibold text-center py-2 z-50"
      >
        You're offline — check your connection and try again
      </div>
    </Transition>

    <!-- Session expired banner -->
    <Transition name="slide-down">
      <div
        v-if="sessionExpired"
        class="fixed top-0 left-0 right-0 bg-red-500 text-white text-xs font-semibold text-center py-2 z-50"
      >
        Your session expired. Please sign in again.
      </div>
    </Transition>

    <!-- Logo / branding -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-white tracking-tight">SalesHub</h1>
      <p class="text-white/50 mt-1 text-sm">Powered by ERPNext</p>
    </div>

    <!-- Login card -->
    <div
      class="bg-white rounded-2xl shadow-xl p-6 transition-transform"
      :class="{ 'animate-shake': shaking }"
    >
      <h2 class="text-lg font-semibold text-gray-900 mb-5">Sign in to continue</h2>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <!-- Username -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="usr">
            Email or Username
          </label>
          <input
            id="usr"
            v-model="form.usr"
            type="text"
            required
            autocomplete="username"
            :disabled="loading || isOffline"
            placeholder="admin@example.com"
            class="w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:bg-surface disabled:text-muted"
            :class="hasError ? 'border-red-400' : 'border-muted/50'"
          />
        </div>

        <!-- Password with show/hide toggle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5" for="pwd">
            Password
          </label>
          <div class="relative">
            <input
              id="pwd"
              v-model="form.pwd"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              :disabled="loading || isOffline"
              placeholder="••••••••"
              class="w-full pl-3.5 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:bg-surface disabled:text-muted"
              :class="hasError ? 'border-red-400' : 'border-muted/50'"
            />
            <button
              type="button"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-gray-600 transition"
              @click="showPassword = !showPassword"
            >
              <!-- Eye / Eye-off icons -->
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error message -->
        <Transition name="fade">
          <div
            v-if="error"
            class="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 mt-0.5 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{{ error }}</span>
          </div>
        </Transition>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading || isOffline"
          class="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-dark active:scale-[.98] disabled:opacity-60 transition"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg
              class="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Signing in…
          </span>
          <span v-else-if="isOffline">No Connection</span>
          <span v-else>Sign In</span>
        </button>
      </form>
    </div>

    <!-- Version / legal footer -->
    <p class="text-center text-white/30 text-xs mt-6">
      SalesHub v1.0 &nbsp;·&nbsp; ERPNext
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFrappeAuth } from '@/composables/useFrappeAuth'

const route = useRoute()
const { login } = useFrappeAuth()

const form = ref({ usr: '', pwd: '' })
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const shaking = ref(false)
const isOffline = ref(!navigator.onLine)

// Show session-expired banner when redirected with ?reason=expired
const sessionExpired = computed(() => route.query.reason === 'expired')
const hasError = computed(() => !!error.value)

window.addEventListener('online', () => { isOffline.value = false })
window.addEventListener('offline', () => { isOffline.value = true })

function triggerShake() {
  shaking.value = true
  setTimeout(() => { shaking.value = false }, 500)
}

function classifyError(e) {
  const msg = e?.message ?? ''
  const status = e?.status ?? 0

  if (isOffline.value) return 'You\'re offline. Check your connection and try again.'
  if (status === 401 || msg.toLowerCase().includes('incorrect')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (status >= 500) return 'Server error. Please try again in a moment.'
  if (msg) return msg
  return 'Login failed. Please check your credentials.'
}

async function handleLogin() {
  if (loading.value || isOffline.value) return
  loading.value = true
  error.value = ''
  try {
    await login(form.value.usr, form.value.pwd)
  } catch (e) {
    error.value = classifyError(e)
    triggerShake()
  } finally {
    loading.value = false
  }
}

// Auto-focus the username field on mount
onMounted(() => {
  document.getElementById('usr')?.focus()
})
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15%       { transform: translateX(-6px); }
  30%       { transform: translateX(6px); }
  45%       { transform: translateX(-4px); }
  60%       { transform: translateX(4px); }
  75%       { transform: translateX(-2px); }
  90%       { transform: translateX(2px); }
}
.animate-shake {
  animation: shake 0.45s ease;
}
</style>
