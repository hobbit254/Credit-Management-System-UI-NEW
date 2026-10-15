import type { AppAbility } from '@/composables/auth/useAbility'
import navItems from '@/navigation/vertical'

// Where someone lands after signing in: the first menu page their role may open.
// Not always the overview, since a role can be created without it. Profile has no permission check.
export function homePath(ability: AppAbility) {
  const links = navItems.flatMap((item: any) => item.children ?? [item])
  const first = links.find((link: any) => link.to && ability.can(link.action, link.subject))

  return first ? `/${first.to}` : '/profile'
}
