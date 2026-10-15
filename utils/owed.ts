import type { OwedSale } from '@/schemas/dashboard_stats'

const DAY = 86_400_000

export const daysSince = (date: string, now: number) => Math.floor((now - new Date(date).getTime()) / DAY)

// Debt age counts from the sale (sales have no due date); "quiet" counts from the last accepted payment.
export function summarizeOwed(sales: OwedSale[], now = Date.now()) {
  const buckets = [
    { label: '0–30 days', max: 30, amount: 0 },
    { label: '31–60 days', max: 60, amount: 0 },
    { label: '61–90 days', max: 90, amount: 0 },
    { label: 'Over 90 days', max: Number.POSITIVE_INFINITY, amount: 0 },
  ]

  const rows = sales.map(sale => ({
    ...sale,
    quietDays: daysSince(sale.last_paid_at ?? sale.sold_at, now),
    paidBefore: sale.last_paid_at !== null,
  }))

  for (const sale of sales)
    buckets.find(b => daysSince(sale.sold_at, now) <= b.max)!.amount += sale.balance

  return {
    total: sales.reduce((sum, sale) => sum + sale.balance, 0),
    count: sales.length,
    buckets,
    quietOver60: rows.filter(row => row.quietDays > 60).length,
    followUps: rows.sort((a, b) => b.quietDays - a.quietDays).slice(0, 5),
  }
}
