import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CACHE_TTL_MS, createStorageCache } from './storageCache'

describe('storageCache', () => {
  let cache

  beforeEach(() => {
    vi.useFakeTimers()
    cache = createStorageCache()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns undefined for a key that was never stored', () => {
    expect(cache.get('missing')).toBeUndefined()
  })

  it('returns a stored value while it is fresh', () => {
    cache.set('products', [{ id: '1' }])
    vi.advanceTimersByTime(CACHE_TTL_MS - 1)

    expect(cache.get('products')).toEqual([{ id: '1' }])
  })

  it('persists entries in localStorage, so they survive a reload', () => {
    cache.set('products', [{ id: '1' }])

    expect(createStorageCache().get('products')).toEqual([{ id: '1' }])
  })

  it('expires a value after one hour and removes it from storage', () => {
    cache.set('products', [{ id: '1' }])
    vi.advanceTimersByTime(CACHE_TTL_MS)

    expect(cache.get('products')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  it('treats a corrupt entry as a miss and removes it', () => {
    localStorage.setItem('mobile-shop:cache:products', '{not json')

    expect(cache.get('products')).toBeUndefined()
    expect(localStorage.length).toBe(0)
  })

  it('does not throw when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    expect(() => cache.set('products', [])).not.toThrow()
    expect(cache.get('products')).toBeUndefined()
  })

  it('prunes expired and corrupt entries, keeping fresh ones and other app data', () => {
    cache.set('old', 1)
    vi.advanceTimersByTime(CACHE_TTL_MS)
    cache.set('fresh', 2)
    localStorage.setItem('mobile-shop:cache:corrupt', '{not json')
    localStorage.setItem('mobile-shop:cart-count', '3')

    cache.prune()

    expect(Object.keys(localStorage).sort()).toEqual([
      'mobile-shop:cache:fresh',
      'mobile-shop:cart-count',
    ])
  })

  it('works with any storage, TTL and clock', () => {
    const entries = new Map()
    const storage = {
      get: (key) => entries.get(key) ?? null,
      set: (key, value) => entries.set(key, value),
      remove: (key) => entries.delete(key),
      keys: () => [...entries.keys()],
    }
    let time = 0
    const memoryCache = createStorageCache({ storage, ttlMs: 10, now: () => time })

    memoryCache.set('a', 1)
    expect(memoryCache.get('a')).toBe(1)

    time = 10
    expect(memoryCache.get('a')).toBeUndefined()
    expect(entries.size).toBe(0)
  })
})
