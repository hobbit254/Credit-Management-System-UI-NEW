import { describe, expect, it } from 'vitest'
import { buildRulesFromRoles, createAppAbility } from '@/composables/auth/useAbility'

const roles = [
  {
    role_name: 'Admin',
    permissions: [
      { permission_slug: 'debtors' },
      { permission_slug: 'debtors/delete' },
      { permission_slug: 'roles' },
    ],
  },
  {
    role_name: 'Staff',
    permissions: [
      { permission_slug: 'debtors' },
    ],
  },
]

describe('buildRulesFromRoles', () => {
  it('grants access only to permissions listed under the user\'s role', () => {
    const ability = createAppAbility()

    ability.update(buildRulesFromRoles('Staff', roles))

    expect(ability.can('access', 'debtors')).toBe(true)
    expect(ability.can('access', 'debtors/delete')).toBe(false)
    expect(ability.can('access', 'roles')).toBe(false)
  })

  it('grants everything assigned to a role with more permissions', () => {
    const ability = createAppAbility()

    ability.update(buildRulesFromRoles('Admin', roles))

    expect(ability.can('access', 'debtors')).toBe(true)
    expect(ability.can('access', 'debtors/delete')).toBe(true)
    expect(ability.can('access', 'roles')).toBe(true)
  })

  it('grants nothing when the role is missing or unmatched', () => {
    const ability = createAppAbility()

    ability.update(buildRulesFromRoles('Unknown Role', roles))
    expect(ability.can('access', 'debtors')).toBe(false)

    ability.update(buildRulesFromRoles(null, roles))
    expect(ability.can('access', 'debtors')).toBe(false)
  })
})
