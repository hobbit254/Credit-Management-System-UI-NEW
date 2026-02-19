import { z } from 'zod'

export const PaymentTransactionItemSchema = z.object({
  transaction_item_uuid: z.uuid(),
  unit_price: z.number(),
  source_type: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})
export type PaymentTransactionItem = z.infer<typeof PaymentTransactionItemSchema>

export const PaymentNestedTransactionSchema = z.object({
  transaction_uuid: z.uuid(),
  transaction_type: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(PaymentTransactionItemSchema),
})
export type PaymentNestedTransaction = z.infer<typeof PaymentNestedTransactionSchema>

// ── Single payment ─────────────────────────────────────────────────────────────

export const PaymentSchema = z.object({
  payment_uuid: z.uuid(),
  amount: z.number(),
  payment_method: z.string(),
  reference_code: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  transaction_items: z.array(z.uuid()),
  transaction: PaymentNestedTransactionSchema,
})
export type Payment = z.infer<typeof PaymentSchema>

// ── Payment list ───────────────────────────────────────────────────────────────

export const PaymentListSchema = z.array(PaymentSchema)
export type PaymentList = z.infer<typeof PaymentListSchema>

// ── Write schemas ──────────────────────────────────────────────────────────────

export const NewPaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  payment_method: z.string().min(1, 'Payment method is required'),
  reference_code: z.string(),
  transaction_uuid: z.uuid('Please select a transaction'),
})
export type NewPayment = z.infer<typeof NewPaymentSchema>

export const UpdatePaymentStatusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
})
export type UpdatePaymentStatus = z.infer<typeof UpdatePaymentStatusSchema>
