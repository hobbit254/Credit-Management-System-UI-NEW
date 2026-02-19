import { z } from 'zod'

export interface ProductInventory {
  inventory_uuid: string
  serial_number: string
  source_type: string
  status: string
  category_uuid: string
  category_name: string
  product_uuid: string
  product_name: string
  product_brand: string
  product_model_number: string
  default_price: number
  supplier_uuid: string
  supplier_shop_name: string
  supplier_name: string
  supplier_phone: string
  active: number
  product_active_status: number
  deleted_at: string
  created_at: string
  updated_at: string
}

export const NewProductInventorySchema = z.object({
  product_uuid: z.string().min(1, 'The product is required'),
  serial_number: z.string().min(1, 'The product serial number is required'),
  source_type: z.string().min(1, 'The product source type is required'),
  status: z.string().min(1, 'The product status is required'),
  supplier_uuid: z.string().min(1, 'Supplier should be provided'),
})
export type NewProductInventory = z.infer<typeof NewProductInventorySchema>
