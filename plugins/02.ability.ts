import { abilitiesPlugin } from '@casl/vue'
import { createAppAbility } from '@/composables/auth/useAbility'
import { verifySession } from '@/composables/auth/useAuthForm'

export default defineNuxtPlugin(async nuxtApp => {
  const ability = createAppAbility()

  nuxtApp.vueApp.use(abilitiesPlugin, ability, { useGlobalProperties: true })
  nuxtApp.provide('ability', ability)

  // The session cookie is httpOnly, so the only way to know if it's still
  // valid is to ask the server. This runs before the first route middleware
  // (Nuxt awaits async plugins before mounting), so `user` reflects the real
  // session state everywhere downstream.
  if (import.meta.client)
    await verifySession()
})
