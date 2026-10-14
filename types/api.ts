// Mirrors the wrapper exposed by plugins/01.api.ts ($api), which is backed
// by ofetch — not axios. Composables type against this instead of
// `AxiosInstance` (axios isn't a dependency; that import never resolved).
// Untyped calls get `any`, like axios; pass T where a response shape matters.
export interface ApiClient {
  get: <T = any>(url: string, options?: Record<string, unknown>) => Promise<{ data: T }>
  post: <T = any>(url: string, body?: BodyInit | Record<string, any>, options?: Record<string, unknown>) => Promise<{ data: T }>
  put: <T = any>(url: string, body?: BodyInit | Record<string, any>, options?: Record<string, unknown>) => Promise<{ data: T }>
  delete: <T = any>(url: string, options?: Record<string, unknown>) => Promise<{ data: T }>
}
