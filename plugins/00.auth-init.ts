// plugins/00.auth-init.ts
export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const accessToken = localStorage.getItem('accessToken')
    const expiry = localStorage.getItem('expiry')
    const user = localStorage.getItem('user')

    if (accessToken)
      useState<string | null>('accessToken').value = accessToken
    if (expiry)
      useState<number | null>('expiry').value = Number(expiry)
    if (user)
      useState('user').value = JSON.parse(user)
  }
})
