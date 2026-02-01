import type { AxiosInstance } from 'axios'
import { type LoginForm, type LoginResponse, type User, createLoginForm } from '@/schemas/auth'
import { useAlert } from '@/composables/alerts/useAlert'

export function useAuthForm() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const { alert: showToast } = useAlert()
  const accessToken = useState<string | null>('accessToken', () => null)
  const expiry = useState<number | null>('expiry', () => null)
  const user = useState<User | null>('user', () => null)
  const loginForm = ref<LoginForm>(createLoginForm())
  const loading = ref(false)

  async function login() {
    loading.value = true
    try {
      const { data } = await $api.post<LoginResponse>('login', loginForm.value)
      const now = Math.floor(Date.now() / 1000)

      console.log(data)

      if (data.status === 'success') {
        accessToken.value = data.data.token
        user.value = data.data.user
        expiry.value = now + data.data.expires_in

        // Optional persistence
        if (import.meta.client) {
          localStorage.setItem('accessToken', data.data.token)
          localStorage.setItem('expiry', (now + data.data.expires_in).toString())
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        showToast({
          title: 'Login Successful',
          text: data.message,
          color: 'success',
          icon: 'tabler-check',
        })
        navigateTo('/dashboard')
      }
      else {
        showToast({
          title: 'Login failed',
          text: data.message || 'Invalid credentials',
          color: 'error',
        })
        throw new Error(data.message || 'Login failed')
      }
    }
    finally {
      loading.value = false
    }
  }
  function isTokenExpired(): boolean {
    try {
      const now = Math.floor(Date.now() / 1000)

      return expiry.value !== null && expiry.value < now
    }
    catch {
      return true
    }
  }

  // 🔹 Computed auth state
  const isAuthenticated = computed(() => {
    return accessToken.value && !isTokenExpired()
  })

  function reset() {
    loginForm.value = createLoginForm()
  }

  return {
    loginForm,
    loading,
    login,
    reset,
    isAuthenticated,
    user,
  }
}
