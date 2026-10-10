import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formats a numeric string as euros', () => {
    expect(formatPrice('170')).toMatch(/^170\s€$/)
  })

  it('keeps decimals when there are any', () => {
    expect(formatPrice('99.5')).toMatch(/^99,5\s€$/)
  })

  it('returns null for missing or invalid prices', () => {
    expect(formatPrice('')).toBeNull()
    expect(formatPrice(undefined)).toBeNull()
    expect(formatPrice('abc')).toBeNull()
  })
})
