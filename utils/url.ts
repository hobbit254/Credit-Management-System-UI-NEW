// The link must point at our own API. Otherwise a crafted link could make the verify-email
// page fetch another site and show that site's message as ours.
// apiBaseUrl may be relative ("/api"): it is then on the page's own origin.
export function isOwnApiUrl(url: string, apiBaseUrl: string, pageOrigin: string) {
  const apiOrigin = new URL(apiBaseUrl || '/api', pageOrigin).origin

  try {
    return new URL(url, apiOrigin).origin === apiOrigin
  }
  catch {
    return false
  }
}
