import type { AppAbility } from '@/composables/auth/useAbility'
import { useAlert } from '@/composables/alerts/useAlert'

interface User {
  user_uuid: string
  full_name: string
  email: string
  email_verified_at: string | null
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
  role_name: string
}

function readCookie(name: string): string | null {
  if (!import.meta.client)
    return null

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))

  return match ? decodeURIComponent(match[1]) : null
}

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  const { alert: showToast } = useAlert()
  const user = useState<User | null>('user')

  const apiBaseUrl = (config.public.apiBaseUrl as string) || '/api'

  // Root app origin, used only for Sanctum's CSRF-cookie route (not under /api).
  const appUrl = (config.public.appUrl as string) || ''

  async function ensureCsrfCookie() {
    await $fetch(`${appUrl}/sanctum/csrf-cookie`, { credentials: 'include' })
  }

  const fetcher = $fetch.create({
    baseURL: apiBaseUrl,
    credentials: 'include',

    async onRequest({ options }) {
      const method = (options.method ?? 'GET').toString().toUpperCase()

      if (method !== 'GET' && method !== 'HEAD') {
        // Every stateful mutating request needs a matching X-XSRF-TOKEN header.
        // Fetch the cookie lazily if it isn't set yet (e.g. a public form
        // submitted before anything else hit the API).
        if (!readCookie('XSRF-TOKEN'))
          await ensureCsrfCookie()

        const xsrfToken = readCookie('XSRF-TOKEN')

        if (xsrfToken) {
          const headers = new Headers(options.headers as HeadersInit)

          headers.set('X-XSRF-TOKEN', xsrfToken)
          options.headers = headers
        }
      }
    },

    onResponseError({ response }) {
      const status = response.status
      let message = 'Unexpected error occurred'
      const responseData = response._data

      if (status === 400) {
        message = responseData?.message || 'Bad request'
      }
      else if (status === 401) {
        message = 'Unauthorized — please log in again'
        user.value = null
        if (import.meta.client) {
          localStorage.removeItem('user')
          if (nuxtApp.$ability)
            (nuxtApp.$ability as AppAbility).update([])
          navigateTo('/login')
        }
      }
      else if (status === 403) {
        message = 'Forbidden — you do not have permission to access this resource'
      }
      else if (status === 404) {
        message = 'Resource not found'
      }
      else if (status === 422) {
        message = responseData?.message || 'Validation failed'
      }
      else if (status === 500) {
        message = 'Server error — please try later'
      }

      showToast({
        title: 'Error',
        text: message,
        color: 'error',
        icon: '$error',
      })
    },
  })

  // Wrapper to mimic Axios API
  const api = {
    get: async <T = unknown>(url: string, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'GET' })

      return { data }
    },

    post: async <T = unknown>(url: string, body?: unknown, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'POST', body })

      return { data }
    },

    put: async <T = unknown>(url: string, body?: unknown, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'PUT', body })

      return { data }
    },
    delete: async <T = unknown>(url: string, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'DELETE' })

      return { data }
    },

    // Expose the raw fetcher if needed
    raw: fetcher,
  }

  nuxtApp.provide('api', api)
  nuxtApp.provide('ensureCsrfCookie', ensureCsrfCookie)
})
