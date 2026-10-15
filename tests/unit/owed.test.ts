import { describe, expect, it } from 'vitest'
import { creditUse, summarizeOwed } from '@/utils/owed'

const now = new Date('2026-10-14T12:00:00Z').getTime()
const daysAgo = (n: number) => new Date(now - n * 86_400_000).toISOString()

const sale = (balance: number, soldDaysAgo: number, paidDaysAgo: number | null) => ({
  transaction_uuid: `t${balance}`,
  debtor_name: 'Shop',
  debtor_phone: '0700000000',
  balance,
  sold_at: daysAgo(soldDaysAgo),
  last_paid_at: paidDaysAgo === null ? null : daysAgo(paidDaysAgo),
})

describe('summarizeOwed', () => {
  it('splits what is owed by days since the sale, with 30, 60 and 90 in the lower bucket', () => {
    const summary = summarizeOwed([sale(100, 30, null), sale(200, 31, 1), sale(300, 90, 5), sale(400, 91, 70)], now)

    expect(summary.total).toBe(1000)
    expect(summary.buckets.map(b => b.amount)).toEqual([100, 200, 300, 400])
  })

  it('puts the longest-quiet customer first, counting from the sale when nothing was paid', () => {
    const summary = summarizeOwed([sale(1, 10, 2), sale(2, 80, null), sale(3, 100, 65)], now)

    expect(summary.followUps.map(f => f.balance)).toEqual([2, 3, 1])
    expect(summary.quietOver60).toBe(2)
  })

  it('handles nothing owed', () => {
    expect(summarizeOwed([], now)).toMatchObject({ total: 0, count: 0, quietOver60: 0, followUps: [] })
  })
})

describe('creditUse', () => {
  it('flags near at 80% and over only past the limit', () => {
    expect(creditUse(790, 1000)).toEqual({ percent: 79, level: 'ok' })
    expect(creditUse(800, 1000)).toEqual({ percent: 80, level: 'near' })
    expect(creditUse(1000, 1000)).toEqual({ percent: 100, level: 'near' })
    expect(creditUse(1030, 1000)).toEqual({ percent: 103, level: 'over' })
  })

  it('treats any debt on a zero limit as over, and nothing owed as fine', () => {
    expect(creditUse(50, 0)).toEqual({ percent: 100, level: 'over' })
    expect(creditUse(0, 0)).toEqual({ percent: 0, level: 'ok' })
  })
})
