import { describe, expect, it } from 'vitest'
import { describeAction } from '@/utils/formatters'

describe('describeAction', () => {
  it('names controller actions by their first word and the entity', () => {
    expect(describeAction('ProductInventoryController.allProductInventory', 'product_inventory')).toBe('Viewed product inventory')
    expect(describeAction('PaymentsController.updatePaymentStatus', 'payments')).toBe('Changed payments')
    expect(describeAction('AuthController.login', 'users')).toBe('Signed in')
  })

  it('keeps an action it does not recognise as it is', () => {
    expect(describeAction('token_blacklist', 'users')).toBe('token_blacklist')
  })
})
