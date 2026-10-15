import { z } from 'zod'

export const ProductStatSchema = z.object({
  product_name: z.string(),
  product_brand: z.string(),
  product_model_number: z.string(),
  source_type: z.string(),
  status: z.string(),
  total: z.number(),
})

export const TransactionStatSchema = z.object({
  total: z.number(),
  status: z.string(),
  transaction_type: z.string(),
})

export const PaymentStatSchema = z.object({
  total: z.number(),
  status: z.string(),
  payment_method: z.string(),
})

export const OwedSaleSchema = z.object({
  transaction_uuid: z.string(),
  debtor_name: z.string().nullable(),
  debtor_phone: z.string().nullable(),
  balance: z.number(),
  sold_at: z.string(),
  last_paid_at: z.string().nullable(),
})

export const PendingPaymentSchema = z.object({
  payment_uuid: z.string(),
  amount: z.number(),
  payment_method: z.string(),
  reference_code: z.string().nullable(),
  debtor_name: z.string().nullable(),
})

export const DashboardStatsSchema = z.object({
  products: z.array(ProductStatSchema),
  transactions: z.array(TransactionStatSchema),
  payments: z.array(PaymentStatSchema),
  refunds: z.number(),
  owed: z.array(OwedSaleSchema),
  pending_payments: z.array(PendingPaymentSchema),
})

export type OwedSale = z.infer<typeof OwedSaleSchema>

export type DashboardStats = z.infer<typeof DashboardStatsSchema>
