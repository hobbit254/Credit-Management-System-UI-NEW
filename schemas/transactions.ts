import { z } from 'zod'

export interface Transaction {
  transaction_uuid: string
  transaction_type: string
  total_expected: number
  payments_sum_amount: number
  status: string
  created_at: string
  updated_at: string
  clerk: Clerk
  debtor: Debtor
  runner: Runner
  sales_person: SalesPerson
  payments: Payment[]
  items: TransactionItem[]
}

export interface Clerk {
  user_uuid: string
  full_name: string
  email: string
  email_verified_at: string | null
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Debtor {
  debtor_uuid: string
  debtor_name: string
  debtor_phone: string
  debtor_email: string
  debtor_type: string
  credit_limit: number | 0
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Runner {
  user_uuid: string
  full_name: string
  email: string
  email_verified_at: string | null
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface SalesPerson {
  debtor_uuid: string
  debtor_name: string
  debtor_phone: string
  debtor_email: string
  debtor_type: string
  credit_limit: number | 0
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  payment_uuid: string
  amount: number
  payment_method: string
  reference_code: string
  status: string
  created_at: string
  updated_at: string
}

export interface ProductInventory {
  inventory_uuid: string
  serial_number: string
  source_type: string
  status: string
  active: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface TransactionItem {
  transaction_item_uuid: string
  unit_price: number
  source_type: string
  status: string
  created_at: string
  updated_at: string
  product_inventory: ProductInventory
}

export const NewTransactionItemSchema = z.object({
  product_inventory_uuid: z.string().uuid('Invalid product inventory UUID'),
  unit_price: z.string().min(1, 'Unit price is required'),
  source_type: z.string().min(1, 'Source type is required'),
  status: z.string().min(1, 'Status is required'),
})
export type NewTransactionItem = z.infer<typeof NewTransactionItemSchema>

const NewRunnerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  id_number: z.string().min(1, 'ID number is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
})

export const NewTransactionSchema = z.object({
  sales_person_id: z.string().uuid('Invalid sales person UUID'),
  debtor_id: z.uuid('Invalid debtor UUID'),
  runner_id: z.uuid('Invalid runner UUID').nullable().optional(),
  new_runner: NewRunnerSchema.nullable().optional(),
  transaction_type: z.string().min(1, 'Transaction type is required'),
  transaction_items: z.array(NewTransactionItemSchema).min(1, 'At least one transaction item is required'),
  payment_method: z.string().optional(),
  amount: z.string().optional(),
  reference_code: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasExisting = !!data.runner_id
  const hasNew = !!data.new_runner

  if (!hasExisting && !hasNew) {
    ctx.addIssue({
      code: 'custom',
      message: 'Either an existing runner or a new runner must be provided',
      path: ['runner_id'],
    })
  }

  if (hasExisting && hasNew) {
    ctx.addIssue({
      code: 'custom',
      message: 'Cannot provide both an existing runner and a new runner',
      path: ['runner_id'],
    })
  }

  if (data.transaction_type !== 'Credit') {
    if (!data.payment_method || data.payment_method.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Payment method is required',
        path: ['payment_method'],
      })
    }

    if (!data.amount || data.amount.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        message: 'Amount is required',
        path: ['amount'],
      })
    }

    if (
      data.transaction_type === 'Sale'
      && data.payment_method
      && data.payment_method !== 'Cash'
      && (!data.reference_code || data.reference_code.trim() === '')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Reference code is required for non-cash payments',
        path: ['reference_code'],
      })
    }
  }
})

export type NewTransaction = z.infer<typeof NewTransactionSchema>
