import { describe, expect, it } from 'vitest'
import { NewTransactionSchema } from '@/schemas/transactions'

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
