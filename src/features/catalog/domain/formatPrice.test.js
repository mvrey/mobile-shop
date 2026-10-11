import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formats a price as euros', () => {
    expect(formatPrice(170)).toMatch(/^170\s€$/)
  })

  it('keeps decimals when there are any', () => {
    expect(formatPrice(99.5)).toMatch(/^99,5\s€$/)
  })

  it('returns null when there is no price', () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(undefined)).toBeNull()
  })
})
