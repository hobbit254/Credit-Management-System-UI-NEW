import { z } from 'zod'

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
}

export const NewDebtorSchema = z.object({
  debtor_name: z.string()
    .min(2, 'Debtor Name must be at least 2 characters')
    .max(255),
  debtor_email: z.email('Invalid email address'),
  debtor_phone: z.string().min(12).max(20),
  debtor_type: z.string(),
  credit_limit: z.coerce.number().default(0),
})
export type NewDebtor = z.infer<typeof NewDebtorSchema>
