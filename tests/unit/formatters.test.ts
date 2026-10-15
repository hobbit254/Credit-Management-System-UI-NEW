import { describe, expect, it } from 'vitest'
import { describeAction, kes, methodLabel, paymentStatus } from '@/utils/formatters'

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

describe('kes', () => {
  it('formats numbers and the strings the API sends for money, and treats empty as 0', () => {
    expect(kes(1284500)).toBe('KES 1,284,500')
    expect(kes('18400.50')).toBe('KES 18,400.5')
    expect(kes(null)).toBe('KES 0')
  })
})

describe('labels', () => {
  it('names request methods and payment statuses in words, keeping unknown ones as they are', () => {
    expect(methodLabel('PUT')).toBe('Change')
    expect(methodLabel('OPTIONS')).toBe('OPTIONS')
    expect(paymentStatus('PENDING')).toEqual({ text: 'Waiting for approval', color: 'warning' })
    expect(paymentStatus('VOID')).toEqual({ text: 'VOID', color: 'default' })
  })
})
