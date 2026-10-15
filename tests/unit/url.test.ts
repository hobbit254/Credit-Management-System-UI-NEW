import { describe, expect, it } from 'vitest'
import { isOwnApiUrl } from '@/utils/url'

const api = 'https://credit-management-system.test/api/v1/'
const page = 'https://app.plugpoint.test'

describe('isOwnApiUrl', () => {
  it('accepts a link to our own API, full or relative', () => {
    expect(isOwnApiUrl('https://credit-management-system.test/api/v1/verify-email/5/abc?signature=x', api, page)).toBe(true)
    expect(isOwnApiUrl('/api/v1/verify-email/5/abc', api, page)).toBe(true)
  })

  it('refuses any other site, including look-alikes and protocol-relative links', () => {
    expect(isOwnApiUrl('https://evil.example/api/v1/verify-email', api, page)).toBe(false)
    expect(isOwnApiUrl('https://credit-management-system.test.evil.example/api', api, page)).toBe(false)
    expect(isOwnApiUrl('http://credit-management-system.test/api/v1/verify-email', api, page)).toBe(false)
    expect(isOwnApiUrl('//evil.example/api/v1/verify-email', api, page)).toBe(false)
  })

  it('refuses garbage', () => {
    expect(isOwnApiUrl('http://[not a url', api, page)).toBe(false)
  })

  it('treats a relative API base as the page\'s own origin', () => {
    expect(isOwnApiUrl('https://app.plugpoint.test/api/v1/verify-email', '/api', page)).toBe(true)
    expect(isOwnApiUrl('https://evil.example/api/v1/verify-email', '/api', page)).toBe(false)
  })
})
