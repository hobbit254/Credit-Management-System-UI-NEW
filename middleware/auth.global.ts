import type { AppAbility } from '@/composables/auth/useAbility'
import type { User } from '@/schemas/auth'
import { homePath } from '@/utils/home'

export default defineNuxtRouteMiddleware(to => {
  if (import.meta.server)
    return

  // The session itself lives in an httpOnly cookie the client can't read.
  // `user` is confirmed against the server on every app boot by
  // plugins/02.ability.ts, so by the time any middleware runs it reflects
  // the real session state.
  const user = useState<User | null>('user')
  const isAuthenticated = user.value !== null

  const isPublic = to.meta.public === true
  const isGuestOnly = to.meta.guestOnly === true

  if (!isAuthenticated) {
    if (!isPublic)
      return navigateTo('/login')

    return
  }

  const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }

  if (isGuestOnly)
    return navigateTo(homePath($ability))

  const subject = to.meta.subject as string | undefined

  if (subject && !$ability.can('access', subject)) {
    return abortNavigation(createError({
      statusCode: 403,
      statusMessage: 'You do not have permission to view this page.',
    }))
  }
})
