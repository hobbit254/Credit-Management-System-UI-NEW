import { describe, expect, it } from 'vitest'
import { phoneNumber } from '@/schemas/phone'

describe('phoneNumber', () => {
  it('accepts numbers as staff type them, with or without spaces or +254', () => {
    for (const number of ['0712345678', '0712 345 678', '+254 712 345 678', '254712345678'])
      expect(phoneNumber.safeParse(number).success).toBe(true)
  })

  it('refuses letters, too few or too many digits, with a message that shows the format', () => {
    for (const number of ['', 'call me', '07123', '0712345678901234']) {
      const result = phoneNumber.safeParse(number)

      expect(result.success).toBe(false)
      expect(result.error?.issues[0]?.message).toBe('Enter a phone number, e.g. 0712 345 678')
    }
  })

  it('trims spaces around the number', () => {
    expect(phoneNumber.parse('  0712 345 678 ')).toBe('0712 345 678')
  })
})
