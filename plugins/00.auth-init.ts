// Optimistic UI hint only — the actual session lives in an httpOnly cookie
// the client can't read, so this is not a trust boundary. plugins/02.ability.ts
// confirms (or clears) this against the server on every app boot.
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const user = localStorage.getItem('user')

    if (user) {
      try {
        useState('user').value = JSON.parse(user)
      }
      catch {
        localStorage.removeItem('user')
      }
    }
  }
})
