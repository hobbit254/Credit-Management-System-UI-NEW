import { AbilityBuilder, type MongoAbility, createMongoAbility } from '@casl/ability'

// Every permission grants ability to access its `permission_slug` (e.g. 'debtors', 'roles/create').
// See the `permissions` table: permission_slug is the ground truth for what a role can do.
export type AppAbility = MongoAbility<['access', string]>

// The user's own role as returned by users/me, so no role ever needs to read the
// whole permission matrix (only Super Admin may).
export interface RoleWithPermissions {
  role_name: string
  role_slug?: string
  permissions?: { permission_slug: string }[]
}

export function createAppAbility(): AppAbility {
  return createMongoAbility<AppAbility>([])
}

export function buildRulesFromRole(role: RoleWithPermissions | undefined) {
  const { can, rules } = new AbilityBuilder<AppAbility>(createMongoAbility)

  // Super Admins pass every check on the server too, so no change to their grants can hide administration from them.
  if (role?.role_slug === 'super_admin')
    can('access', 'all')
  else
    role?.permissions?.forEach(permission => can('access', permission.permission_slug))

  return rules
}
