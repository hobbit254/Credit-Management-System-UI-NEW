import { AbilityBuilder, type MongoAbility, createMongoAbility } from '@casl/ability'
import type { ApiClient } from '@/types/api'
import type { User } from '@/schemas/auth'

// Every permission grants ability to access its `permission_slug` (e.g. 'debtors', 'roles/create').
// See the `permissions` table: permission_slug is the ground truth for what a role can do.
export type AppAbility = MongoAbility<['access', string]>

interface RoleWithPermissions {
  role_name: string
  permissions: { permission_slug: string }[]
}

export function createAppAbility(): AppAbility {
  return createMongoAbility<AppAbility>([])
}

export function buildRulesFromRoles(roleName: string | null | undefined, roles: RoleWithPermissions[]) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility)

  if (roleName) {
    const role = roles.find(r => r.role_name === roleName)

    role?.permissions.forEach(permission => can('access', permission.permission_slug))
  }

  return rules
}

export async function refreshAbility() {
  const { $api, $ability } = useNuxtApp() as unknown as { $api: ApiClient; $ability: AppAbility }
  const user = useState<User | null>('user')

  if (!user.value) {
    $ability.update([])

    return
  }

  try {
    const { data } = await $api.get<{ data: { roles: { data: RoleWithPermissions[] } } }>('permission-matrix')
    const roles = data?.data?.roles?.data ?? []

    $ability.update(buildRulesFromRoles(user.value.role_name, roles))
  }
  catch {
    // If the matrix can't be fetched, fail closed: no permission-gated pages are accessible
    // until it succeeds again (the global auth check on #1 already covers logged-in-or-not).
    $ability.update([])
  }
}
