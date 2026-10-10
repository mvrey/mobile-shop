import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CartProvider } from './CartProvider'
import { useCart } from './useCart'

function renderCart() {
  return renderHook(() => useCart(), { wrapper: CartProvider })
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

  it('adds items and persists the new count', () => {
    const { result } = renderCart()

    act(() => result.current.addItems(1))
    act(() => result.current.addItems(2))

    expect(result.current.count).toBe(3)
    expect(localStorage.getItem('mobile-shop:cart-count')).toBe('3')
  })

  it('throws a clear error when used outside the provider', () => {
    expect(() => renderHook(() => useCart())).toThrow(/inside a <CartProvider>/)
  })
})
