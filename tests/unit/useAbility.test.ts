import { describe, expect, it } from 'vitest'
import { buildRulesFromRole, createAppAbility } from '@/composables/auth/useAbility'

const staff = {
  role_name: 'Staff',
  permissions: [
    { permission_slug: 'debtors' },
  ],
}

describe('buildRulesFromRole', () => {
  it('grants access only to the permissions listed on the role', () => {
    const ability = createAppAbility()

    ability.update(buildRulesFromRole(staff))

    expect(ability.can('access', 'debtors')).toBe(true)
    expect(ability.can('access', 'debtors/delete')).toBe(false)
    expect(ability.can('access', 'roles')).toBe(false)
  })

  it('grants nothing when the role or its permissions are missing', () => {
    const ability = createAppAbility()

    ability.update(buildRulesFromRole(undefined))
    expect(ability.can('access', 'debtors')).toBe(false)

    ability.update(buildRulesFromRole({ role_name: 'Staff' }))
    expect(ability.can('access', 'debtors')).toBe(false)
  })
})
