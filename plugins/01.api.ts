import { useAlert } from '@/composables/alerts/useAlert'
import { clearSession } from '@/composables/auth/useAuthForm'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  const { alert: showToast } = useAlert()

  const apiBaseUrl = (config.public.apiBaseUrl as string) || '/api'

  // The frontend and API live on different registrable domains, so frontend
  // JS can never read the API's cookies via document.cookie — that's a
  // browser same-origin restriction, not something config can work around.
  // So instead of the usual "read the XSRF-TOKEN cookie, echo it back"
  // dance, the backend hands the raw CSRF token back in a JSON body
  // (GET csrf-token) and we keep it in memory here, sending it as
  // X-CSRF-TOKEN — the header Laravel compares as a *raw* value. (The
  // similarly-named X-XSRF-TOKEN header is for the *encrypted* cookie
  // ciphertext instead and will always fail here.)
  let csrfToken: string | null = null

  // Uses the raw $fetch rather than the wrapped `fetcher` below: this is
  // always a GET, which never needs the CSRF header anyway, and avoiding
  // the circular reference keeps the two functions independently readable.
  async function fetchCsrfToken(): Promise<string | null> {
    try {
      const data = await $fetch<{ csrfToken: string }>('csrf-token', {
        baseURL: apiBaseUrl,
        credentials: 'include',
      })

      csrfToken = data.csrfToken
    }
    catch {
      csrfToken = null
    }

    return csrfToken
  }

  const fetcher = $fetch.create({
    baseURL: apiBaseUrl,
    credentials: 'include',

    // A 419 almost always means our cached token went stale (e.g. the
    // session was invalidated by a prior logout). Retry once, transparently,
    // after onResponseError below clears it and onRequest fetches a fresh one.
    retry: 1,
    retryStatusCodes: [419],

    async onRequest({ options }) {
      // Without this, Laravel's expectsJson() is false, so an expired/missing
      // session falls through to Authenticate::redirectTo(), which calls
      // route('login') — undefined in this API-only app — turning what should
      // be a clean 401 into an unhandled 500.
      const headers = new Headers(options.headers as HeadersInit)

      headers.set('Accept', 'application/json')
      options.headers = headers

      const method = (options.method ?? 'GET').toString().toUpperCase()

      if (method !== 'GET' && method !== 'HEAD') {
        if (!csrfToken)
          await fetchCsrfToken()

        if (csrfToken) {
          headers.set('X-CSRF-TOKEN', csrfToken)
          options.headers = headers
        }
      }
    },

    onResponseError({ response, options }) {
      const status = response.status
      const responseData = response._data

      if (status === 419) {
        // Drop the stale token so the retry's onRequest fetches a fresh one.
        csrfToken = null

        // options.retry is the *remaining* retry count for this attempt —
        // if it's still > 0, ofetch is about to retry automatically, so
        // don't show an error for what the user will never actually see.
        if (typeof options.retry === 'number' && options.retry > 0)
          return
      }

      let message = 'Unexpected error occurred'

      if (status === 400) {
        message = responseData?.message || 'Bad request'
      }
      else if (status === 401) {
        // Show the server's reason (wrong password, account deactivated) unless
        // it's the generic "Unauthenticated", which just means the session ended.
        const serverMessage: string | undefined = responseData?.message

        message = serverMessage && !/^unauthenticated\.?$/i.test(serverMessage)
          ? serverMessage
          : 'Unauthorized — please log in again'
        nuxtApp.runWithContext(clearSession)
        navigateTo('/login')
      }
      else if (status === 403) {
        // e.g. "This account has been deactivated. Contact an administrator." on login
        message = responseData?.message || 'Forbidden — you do not have permission to access this resource'
      }
      else if (status === 404) {
        message = 'Resource not found'
      }
      else if (status === 419) {
        // Retries exhausted — the session really is gone.
        message = 'Your session has expired. Please log in again.'
        nuxtApp.runWithContext(clearSession)
        navigateTo('/login')
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
    get: async <T = any>(url: string, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'GET' })

      return { data }
    },

    post: async <T = any>(url: string, body?: BodyInit | Record<string, any>, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'POST', body })

      return { data }
    },

    put: async <T = any>(url: string, body?: BodyInit | Record<string, any>, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'PUT', body })

      return { data }
    },
    delete: async <T = any>(url: string, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'DELETE' })

      return { data }
    },

    // Expose the raw fetcher if needed
    raw: fetcher,
  }

  nuxtApp.provide('api', api)
  nuxtApp.provide('ensureCsrfToken', fetchCsrfToken)
})
