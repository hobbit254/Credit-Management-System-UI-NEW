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

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()
  const { alert: showToast } = useAlert()
  const accessToken = useState<string | null>('accessToken')
  const expiry = useState<number | null>('expiry')
  const user = useState<User | null>('user')

  // const { alert: showToast } = useAlert()

  const fetcher = $fetch.create({
    baseURL: (config.public.apiBaseUrl as string) || '/api',

    onRequest({ options }) {
      if (accessToken.value) {
        const now = Math.floor(Date.now() / 1000)
        if (expiry.value && expiry.value < now) {
          accessToken.value = null
          user.value = null
          expiry.value = null
          if (import.meta.client)
            navigateTo('/')

          throw new Error('Token expired')
        }

        options.headers = options.headers || {}

        const headers = options.headers as any

        if (headers instanceof Headers)
          headers.set('Authorization', `Bearer ${accessToken.value}`)
        else
          headers.Authorization = `Bearer ${accessToken.value}`
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
        accessToken.value = null
        user.value = null
        expiry.value = null
        if (import.meta.client)
          navigateTo('/')
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

      console.log(response)
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

    post: async <T = unknown>(url: string, body?: any, options?: Record<string, unknown>) => {
      const data = await fetcher<T>(url, { ...options, method: 'POST', body })

      return { data }
    },

    put: async <T = unknown>(url: string, body?: any, options?: Record<string, unknown>) => {
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
})
