import { describe, expect, it } from 'vitest'
import { emailValidator, passwordValidator, requiredValidator } from '@core/utils/validators'

describe('requiredValidator', () => {
  it('rejects empty, null, and undefined values', () => {
    expect(requiredValidator('')).not.toBe(true)
    expect(requiredValidator(null)).not.toBe(true)
    expect(requiredValidator(undefined)).not.toBe(true)
  })

  it('accepts non-empty values', () => {
    expect(requiredValidator('kevin@example.com')).toBe(true)
  })
})

describe('emailValidator', () => {
  it('accepts a valid email', () => {
    expect(emailValidator('kevin@example.com')).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(emailValidator('not-an-email')).not.toBe(true)
  })
})

describe('passwordValidator', () => {
  it('requires upper, lower, digit, special char, and 8+ length', () => {
    expect(passwordValidator('Password1!')).toBe(true)
    expect(passwordValidator('weak')).not.toBe(true)
  })
})
