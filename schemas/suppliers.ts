import { z } from 'zod'

export interface Supplier {
  supplier_uuid: string
  supplier_shop_name: string
  supplier_name: string
  supplier_phone: string
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export const NewSupplierSchema = z.object({
  supplier_shop_name: z.string()
    .min(2)
    .max(200),
  supplier_name: z.string()
    .min(2)
    .max(200),
  supplier_phone: z.string()
    .min(12)
    .max(20),
})
export type NewSupplier = z.infer<typeof NewSupplierSchema>
