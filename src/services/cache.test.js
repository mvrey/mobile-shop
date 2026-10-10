import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CACHE_TTL_MS, getCached, setCached } from './cache'

describe('cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns undefined for a key that was never stored', () => {
    expect(getCached('missing')).toBeUndefined()
  })

  it('returns a stored value while it is fresh', () => {
    setCached('products', [{ id: '1' }])
    vi.advanceTimersByTime(CACHE_TTL_MS - 1)

    expect(getCached('products')).toEqual([{ id: '1' }])
  })

  it('expires a value after one hour and removes it from storage', () => {
    setCached('products', [{ id: '1' }])
    vi.advanceTimersByTime(CACHE_TTL_MS)

    expect(getCached('products')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  it('treats a corrupt entry as a miss', () => {
    localStorage.setItem('mobile-shop:cache:products', '{not json')

    expect(getCached('products')).toBeUndefined()
  })

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(() => setCached('products', [])).not.toThrow()
    expect(getCached('products')).toBeUndefined()
  })
})
