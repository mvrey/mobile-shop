import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartProvider } from './CartProvider'
import { useCart } from './useCart'

function renderCart(request = vi.fn(() => Promise.resolve({ count: 1 }))) {
  const wrapper = ({ children }) => <CartProvider request={request}>{children}</CartProvider>
  return { ...renderHook(() => useCart(), { wrapper }), request }
}

describe('CartProvider', () => {
  it('starts empty when nothing is stored', () => {
    const { result } = renderCart()

    expect(result.current.count).toBe(0)
  })

  it('restores the stored count', () => {
    localStorage.setItem('mobile-shop:cart-count', '4')

    const { result } = renderCart()

    expect(result.current.count).toBe(4)
  })

  it('ignores an invalid stored value', () => {
    localStorage.setItem('mobile-shop:cart-count', 'banana')

    const { result } = renderCart()

    expect(result.current.count).toBe(0)
  })

  it('sends the selection to the API, adds to the count and persists it', async () => {
    const { result, request } = renderCart()
    const selection = { id: 'a', colorCode: 1, storageCode: 2 }

    await act(() => result.current.addToCart(selection))
    await act(() => result.current.addToCart(selection))

    expect(request).toHaveBeenCalledWith(selection)
    expect(result.current.count).toBe(2)
    expect(localStorage.getItem('mobile-shop:cart-count')).toBe('2')
  })

  it('leaves the count unchanged when the API call fails', async () => {
    const { result } = renderCart(vi.fn(() => Promise.reject(new Error('down'))))

    await act(() => expect(result.current.addToCart({ id: 'a' })).rejects.toThrow('down'))

    expect(result.current.count).toBe(0)
  })

  it('follows the count when another tab changes it', () => {
    const { result } = renderCart()

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'mobile-shop:cart-count', newValue: '7' }),
      )
    })

    expect(result.current.count).toBe(7)
  })

  it('ignores storage changes to other keys', () => {
    const { result } = renderCart()

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: '7' }))
    })

    expect(result.current.count).toBe(0)
  })

  it('throws a clear error when used outside the provider', () => {
    expect(() => renderHook(() => useCart())).toThrow(/inside a <CartProvider>/)
  })
})
