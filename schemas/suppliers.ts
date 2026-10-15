import { z } from 'zod'
import { phoneNumber } from '@/schemas/phone'

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
  supplier_phone: phoneNumber,
})
export type NewSupplier = z.infer<typeof NewSupplierSchema>
