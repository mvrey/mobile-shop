import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formats a whole price as euros, without decimals', () => {
    expect(formatPrice(170)).toBe('€170')
  })

  it('shows cents when there are any', () => {
    expect(formatPrice(99.5)).toBe('€99.50')
  })

  it('returns null when there is no price', () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(undefined)).toBeNull()
  })
})
