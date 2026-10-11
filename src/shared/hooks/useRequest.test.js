import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRequest } from './useRequest'

// A promise that the test settles by hand, to control the order of responses.
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useRequest', () => {
  it('is loading until the data arrives', async () => {
    const request = deferred()
    const { result } = renderHook(() => useRequest('key', () => request.promise))

    expect(result.current).toMatchObject({ loading: true, data: undefined, error: null })

    await act(() => request.resolve('data'))

    expect(result.current).toMatchObject({ loading: false, data: 'data', error: null })
  })

  it('reports an error, and retry loads again', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('data')
    const { result } = renderHook(() => useRequest('key', load))

    await waitFor(() => expect(result.current.error).toEqual(new Error('down')))
    expect(result.current.loading).toBe(false)

    act(() => result.current.retry())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.data).toBe('data'))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('starts a new request when the key changes, and ignores the old answer', async () => {
    const requests = { a: deferred(), b: deferred() }
    const { result, rerender } = renderHook(
      ({ id }) => useRequest(id, () => requests[id].promise),
      {
        initialProps: { id: 'a' },
      },
    )

    rerender({ id: 'b' })
    await act(() => requests.b.resolve('B'))
    await act(() => requests.a.resolve('A')) // arrives late: must not win

    expect(result.current.data).toBe('B')
  })

  it('shows data it can peek at right away, without a loading state', () => {
    const { result } = renderHook(() =>
      useRequest('key', () => new Promise(() => {}), { peek: () => 'cached' }),
    )

    expect(result.current).toMatchObject({ loading: false, data: 'cached', error: null })
  })

  it('loads normally when there is nothing to peek at', () => {
    const { result } = renderHook(() =>
      useRequest('key', () => new Promise(() => {}), { peek: () => undefined }),
    )

    expect(result.current.loading).toBe(true)
  })

  it('does not reload when only the load function changes', () => {
    const load = vi.fn(() => new Promise(() => {}))
    const { rerender } = renderHook(() => useRequest('key', () => load()))

    rerender()
    rerender()

    expect(load).toHaveBeenCalledTimes(1)
  })
})
