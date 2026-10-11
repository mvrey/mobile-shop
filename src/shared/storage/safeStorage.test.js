import { afterEach, describe, expect, it, vi } from 'vitest'
import { safeStorage } from './safeStorage'

describe('safeStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores, reads and removes values under the app prefix', () => {
    safeStorage.set('greeting', 'hello')

    expect(localStorage.getItem('mobile-shop:greeting')).toBe('hello')
    expect(safeStorage.get('greeting')).toBe('hello')

    safeStorage.remove('greeting')
    expect(safeStorage.get('greeting')).toBeNull()
  })

  it('lists only the keys the app stored', () => {
    safeStorage.set('a', '1')
    localStorage.setItem('other-app', 'x')

    expect(safeStorage.keys()).toEqual(['a'])
  })

  it('never throws when storage is unavailable', () => {
    for (const method of ['getItem', 'setItem', 'removeItem']) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error('SecurityError')
      })
    }

    expect(() => safeStorage.set('key', 'value')).not.toThrow()
    expect(safeStorage.get('key')).toBeNull()
    expect(() => safeStorage.remove('key')).not.toThrow()
  })
})
