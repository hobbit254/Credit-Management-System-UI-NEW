import { describe, expect, it } from 'vitest'
import { buildRulesFromRole, createAppAbility } from '@/composables/auth/useAbility'
import { homePath } from '@/utils/home'

const abilityFor = (...slugs: string[]) => {
  const ability = createAppAbility()

  ability.update(buildRulesFromRole({ role_name: 'Test', permissions: slugs.map(slug => ({ permission_slug: slug })) }))

  return ability
}

describe('homePath', () => {
  it('opens the overview for a role that has it', () => {
    expect(homePath(abilityFor('v1/payments', 'v1/dashboard_stats'))).toBe('/dashboard')
  })

  it('opens the first menu page a role may see when it has no overview, including pages inside a group', () => {
    expect(homePath(abilityFor('v1/payments'))).toBe('/payments')
    expect(homePath(abilityFor('v1/suppliers'))).toBe('/suppliers')
  })

  it('falls back to the profile for a role with no menu pages', () => {
    expect(homePath(abilityFor())).toBe('/profile')
  })
})
