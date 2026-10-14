import type { ApiClient } from '@/types/api'
import { type LoginForm, type LoginResponse, type User, createLoginForm } from '@/schemas/auth'
import { useAlert } from '@/composables/alerts/useAlert'
import { type AppAbility, type RoleWithPermissions, buildRulesFromRole } from '@/composables/auth/useAbility'
import { clearNotifications } from '@/composables/notifications/useNotification'

interface MeResponseUser extends Omit<User, 'role_name'> {
  roles?: RoleWithPermissions[]
}

// Forgets the signed-in user everywhere: state, localStorage, permissions, notifications.
export function clearSession() {
  const { $ability } = useNuxtApp() as unknown as { $ability?: AppAbility }

  useState<User | null>('user').value = null
  $ability?.update([])
  clearNotifications()
  if (import.meta.client)
    localStorage.removeItem('user')
}

// The session lives in an httpOnly cookie, so this is the only way to know
// if it's still valid — confirms (or clears) `user` against the server.
// Called on every app boot, before any route middleware runs, and after login.
// Also sets the ability from the user's own role permissions.
// Plain $fetch, not $api: a 401 here just means "logged out", so it must not
// trigger $api's error toast and redirect to /login (e.g. on /verify-email).
export async function verifySession() {
  const config = useRuntimeConfig()
  const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }
  const user = useState<User | null>('user')

  try {
    const data = await $fetch<{ data: MeResponseUser[] }>('users/me', {
      baseURL: (config.public.apiBaseUrl as string) || '/api',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    const me = data?.data?.[0]

    if (!me)
      throw new Error('No user in response')

    const { roles, ...rest } = me
    const resolved: User = { ...rest, role_name: roles?.[0]?.role_name ?? '' }

    user.value = resolved
    $ability.update(buildRulesFromRole(roles?.[0]))
    if (import.meta.client)
      localStorage.setItem('user', JSON.stringify(resolved))
  }
  catch {
    clearSession()
  }
}

export function useAuthForm() {
  const { $api, $ensureCsrfToken } = useNuxtApp() as unknown as { $api: ApiClient; $ensureCsrfToken: () => Promise<string | null> }
  const { alert: showToast } = useAlert()
  const user = useState<User | null>('user', () => null)
  const loginForm = ref<LoginForm>(createLoginForm())
  const loading = ref(false)

  async function login() {
    loading.value = true
    try {
      await $ensureCsrfToken()

      const { data } = await $api.post<LoginResponse>('login', loginForm.value)

      if (data.status === 'success') {
        user.value = data.data.user

        if (import.meta.client)
          localStorage.setItem('user', JSON.stringify(data.data.user))

        await verifySession()
        showToast({
          title: 'Login Successful',
          text: data.message,
          color: 'success',
          icon: '$success',
        })
        navigateTo('/dashboard')
      }
      else {
        showToast({
          title: 'Login failed',
          text: data.message || 'Invalid credentials',
          color: 'error',
          icon: '$error',
        })
        throw new Error(data.message || 'Login failed')
      }
    }
    finally {
      loading.value = false
    }
  }

  const isAuthenticated = computed(() => user.value !== null)

  function reset() {
    loginForm.value = createLoginForm()
  }

  async function logout() {
    try {
      await $api.post('logout')
    }
    catch {
      // Best-effort — clear local state regardless of whether the server call succeeded.
    }

    clearSession()

    navigateTo('/login')
  }

  async function verifyEmail(redirectUrl: string) {
    const { data } = await $api.get(redirectUrl)

    showToast({
      title: 'Verify email',
      text: data.message || 'Verify email',
      color: data.message === 'Invalid verification link.' ? 'error' : 'success',
      icon: '$error',
    })

    return data
  }

  async function resendEmail(email: string) {
    const { data } = await $api.post('resendVerificationEmail', {
      email,
    })

    showToast({
      title: 'Resend email',
      text: data.message || 'Resend email',
      color: 'success',
      icon: '$success',
    })
  }

  return {
    loginForm,
    loading,
    login,
    reset,
    isAuthenticated,
    user,
    logout,
    verifyEmail,
    resendEmail,
  }
}
