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

  it('notifies changes to a key made in another tab, until unsubscribed', () => {
    const onChange = vi.fn()
    const unsubscribe = safeStorage.subscribe('count', onChange)
    const otherTabSets = (key, newValue) =>
      window.dispatchEvent(new StorageEvent('storage', { key, newValue }))

    otherTabSets('mobile-shop:count', '2')
    otherTabSets('mobile-shop:other', '3')
    unsubscribe()
    otherTabSets('mobile-shop:count', '4')

    expect(onChange.mock.calls).toEqual([['2']])
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
