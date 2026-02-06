import { z } from 'zod'

export interface Product {
  category_uuid: string
  category_name: string
  product_uuid: string
  product_name: string
  product_brand: string
  product_model_number: string
  default_price: number | 0
  active: number
  deleted_at: string
  created_at: string
  updated_at: string
}

export const NewProductSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  product_model_number: z.string().min(1, 'Product model number is required'),
  category_uuid: z.string().min(1, 'Category uuid is required'),
  product_brand: z.string().min(1, 'Product brand is required'),
  default_price: z.number().optional(),
})
export type NewProduct = z.infer<typeof NewProductSchema>
