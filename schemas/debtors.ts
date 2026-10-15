import { z } from 'zod'
import { phoneNumber } from '@/schemas/phone'

export interface Debtor {
  debtor_uuid: string
  debtor_name: string
  debtor_phone: string
  debtor_email: string
  debtor_type: string
  credit_limit: number | 0
  active: number
  deleted_at: string
  created_at: string
  updated_at: string
  owed: number // on open sales, accepted payments only
  last_paid_at: string | null
}

export const NewDebtorSchema = z.object({
  debtor_name: z.string()
    .min(2, 'Debtor Name must be at least 2 characters')
    .max(255),
  debtor_email: z.email('Invalid email address'),
  debtor_phone: phoneNumber,
  debtor_type: z.string(),
  credit_limit: z.coerce.number().default(0),
})
export type NewDebtor = z.infer<typeof NewDebtorSchema>
