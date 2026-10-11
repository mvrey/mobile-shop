import { describe, expect, it, vi } from 'vitest'
import { createCachedFetcher } from './cachedFetcher'

function memoryCache() {
  const entries = new Map()
  return { get: (key) => entries.get(key), set: (key, value) => entries.set(key, value) }
}

describe('createCachedFetcher', () => {
  it('loads on a miss, then serves the cached value', async () => {
    const cached = createCachedFetcher({ cache: memoryCache() })
    const load = vi.fn(() => Promise.resolve('data'))

    await expect(cached('key', load)).resolves.toBe('data')
    await expect(cached('key', load)).resolves.toBe('data')

    expect(load).toHaveBeenCalledTimes(1)
  })

  it('caches each key separately', async () => {
    const cached = createCachedFetcher({ cache: memoryCache() })

    await expect(cached('a', () => Promise.resolve('A'))).resolves.toBe('A')
    await expect(cached('b', () => Promise.resolve('B'))).resolves.toBe('B')
  })

  it('shares one load between concurrent callers', async () => {
    const cached = createCachedFetcher({ cache: memoryCache() })
    const load = vi.fn(() => Promise.resolve('data'))

    const results = await Promise.all([cached('key', load), cached('key', load)])

    expect(results).toEqual(['data', 'data'])
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('does not cache failures, so the next call loads again', async () => {
    const cached = createCachedFetcher({ cache: memoryCache() })
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('data')

    await expect(cached('key', load)).rejects.toThrow('down')
    await expect(cached('key', load)).resolves.toBe('data')
    expect(load).toHaveBeenCalledTimes(2)
  })
})
