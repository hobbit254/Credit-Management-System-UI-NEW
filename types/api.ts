// Mirrors the wrapper exposed by plugins/01.api.ts ($api), which is backed
// by ofetch — not axios. Composables type against this instead of
// `AxiosInstance` (axios isn't a dependency; that import never resolved).
export interface ApiClient {
  get: <T = unknown>(url: string, options?: Record<string, unknown>) => Promise<{ data: T }>
  post: <T = unknown>(url: string, body?: unknown, options?: Record<string, unknown>) => Promise<{ data: T }>
  put: <T = unknown>(url: string, body?: unknown, options?: Record<string, unknown>) => Promise<{ data: T }>
  delete: <T = unknown>(url: string, options?: Record<string, unknown>) => Promise<{ data: T }>
}
