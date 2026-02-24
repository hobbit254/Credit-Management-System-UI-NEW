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

export const DashboardStatsSchema = z.object({
  products: z.array(ProductStatSchema),
  transactions: z.array(TransactionStatSchema),
  payments: z.array(PaymentStatSchema),
})

export type DashboardStats = z.infer<typeof DashboardStatsSchema>
