import { describe, expect, it } from 'vitest'
import { NewProductSchema } from '@/schemas/products'

const product = { product_name: 'Galaxy A15', product_model_number: 'A15', category_uuid: 'c', product_brand: 'Samsung' }

describe('NewProductSchema', () => {
  it('refuses an empty price instead of saving KES 0', () => {
    expect(NewProductSchema.safeParse({ ...product, default_price: '' }).success).toBe(false)
  })

  it('takes a typed price, including 0', () => {
    expect(NewProductSchema.parse({ ...product, default_price: '1500' }).default_price).toBe(1500)
    expect(NewProductSchema.parse({ ...product, default_price: 0 }).default_price).toBe(0)
  })
})
