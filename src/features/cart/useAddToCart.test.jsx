import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CartProvider } from './CartProvider'
import { useAddToCart } from './useAddToCart'

function renderAddToCart(request) {
  const wrapper = ({ children }) => <CartProvider request={request}>{children}</CartProvider>
  return renderHook(() => useAddToCart(), { wrapper })
}

const selection = { id: 'a', colorCode: 1, storageCode: 2 }

describe('useAddToCart', () => {
  it('goes from idle to adding to added', async () => {
    let finish
    const request = vi.fn(() => new Promise((resolve) => (finish = resolve)))
    const { result } = renderAddToCart(request)

    expect(result.current.status).toBe('idle')

    act(() => {
      result.current.add(selection)
    })
    expect(result.current.status).toBe('adding')

    await act(() => finish({ count: 1 }))
    expect(result.current.status).toBe('added')
  })

  it('reports an error when the add fails', async () => {
    const { result } = renderAddToCart(vi.fn(() => Promise.reject(new Error('down'))))

    await act(() => result.current.add(selection))

    expect(result.current.status).toBe('error')
  })

  it('reset clears a finished outcome but not an add in progress', async () => {
    let finish
    const request = vi.fn(() => new Promise((resolve) => (finish = resolve)))
    const { result } = renderAddToCart(request)

    act(() => {
      result.current.add(selection)
    })
    act(() => result.current.reset())
    expect(result.current.status).toBe('adding')

    await act(() => finish({ count: 1 }))
    act(() => result.current.reset())
    expect(result.current.status).toBe('idle')
  })
})
