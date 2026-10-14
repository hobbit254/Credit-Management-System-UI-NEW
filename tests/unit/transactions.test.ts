import { describe, expect, it } from 'vitest'
import { NewTransactionSchema, hasCents } from '@/schemas/transactions'
import { NewPaymentSchema } from '@/schemas/payments'

const valid = {
  sales_person_id: '0b6f2c3e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
  debtor_id: '1b6f2c3e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
  runner_id: '2b6f2c3e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
  transaction_type: 'Sale',
  transaction_items: [{
    product_inventory_uuid: '3b6f2c3e-1a2b-4c3d-8e4f-5a6b7c8d9e0f',
    unit_price: '1500',
    source_type: 'Inventory',
    status: 'OnSale',
  }],
  payment_method: 'Cash',
  amount: '1500',
  reference_code: '',
}

describe('NewTransactionSchema amounts', () => {
  it('accepts a positive amount and unit price', () => {
    expect(NewTransactionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects zero or negative amounts and unit prices', () => {
    expect(NewTransactionSchema.safeParse({ ...valid, amount: '-100' }).success).toBe(false)
    expect(NewTransactionSchema.safeParse({ ...valid, amount: '0' }).success).toBe(false)
    expect(NewTransactionSchema.safeParse({
      ...valid,
      transaction_items: [{ ...valid.transaction_items[0], unit_price: '-5' }],
    }).success).toBe(false)
  })

  it('still lets a Credit transaction leave the amount empty', () => {
    expect(NewTransactionSchema.safeParse({ ...valid, transaction_type: 'Credit', payment_method: '', amount: '' }).success).toBe(true)
  })
})

describe('a cash sale is paid in full', () => {
  const twoItems = { ...valid, transaction_items: [valid.transaction_items[0], { ...valid.transaction_items[0], unit_price: '250.50' }] }

  it('accepts the exact total, compared in whole cents', () => {
    expect(NewTransactionSchema.safeParse({ ...twoItems, amount: '1750.50' }).success).toBe(true)
    expect(NewTransactionSchema.safeParse({ ...valid, transaction_items: [{ ...valid.transaction_items[0], unit_price: '0.1' }, { ...valid.transaction_items[0], unit_price: '0.2' }], amount: '0.3' }).success).toBe(true)
  })

  it('refuses one cent short, and says what the total is', () => {
    const result = NewTransactionSchema.safeParse({ ...twoItems, amount: '1750.49' })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map(i => i.message)).toContain('A sale is paid in full: the amount must be 1750.50. Use a credit sale to pay later.')
  })
})

describe('money has at most 2 decimals', () => {
  it('hasCents accepts whole and 2-decimal amounts only', () => {
    expect(['', '100', '100.5', '100.50', ' 7.25 '].every(hasCents)).toBe(true)
    expect(['100.555', '1e3', '-5', 'abc', '10,5'].some(hasCents)).toBe(false)
  })

  it('refuses a third decimal on prices and amounts', () => {
    expect(NewTransactionSchema.safeParse({ ...valid, amount: '1500.001' }).success).toBe(false)
    expect(NewTransactionSchema.safeParse({ ...valid, transaction_type: 'Credit', amount: '', transaction_items: [{ ...valid.transaction_items[0], unit_price: '10.555' }] }).success).toBe(false)
  })
})

describe('NewPaymentSchema', () => {
  const payment = { amount: '500', payment_method: 'Cash', reference_code: '', transaction_uuid: valid.debtor_id }

  it('accepts a positive 2-decimal amount', () => {
    expect(NewPaymentSchema.safeParse({ ...payment, amount: '499.99' }).success).toBe(true)
  })

  it('refuses zero, negative, 3-decimal or missing amounts, and a missing sale', () => {
    for (const amount of ['0', '-1', '10.001', ''])
      expect(NewPaymentSchema.safeParse({ ...payment, amount }).success).toBe(false)
    expect(NewPaymentSchema.safeParse({ ...payment, transaction_uuid: '' }).success).toBe(false)
  })
})
