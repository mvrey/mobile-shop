import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError } from '../../../shared/api/httpClient'
import { addToCart } from './cartApi'

function jsonResponse(body) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
}

const selection = { id: 'a', colorCode: 1000, storageCode: 2000 }

describe('cartApi.addToCart', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts the selection as JSON and returns the cart count', async () => {
    fetchMock.mockReturnValue(jsonResponse({ count: 1 }))

    await expect(addToCart(selection)).resolves.toEqual({ count: 1 })
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selection),
    })
  })

  it('is never cached', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ count: 1 }))

    await addToCart(selection)
    await addToCart(selection)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([{}, { count: 'one' }, { count: -1 }, null])(
    'rejects a response without a valid count: %j',
    async (body) => {
      fetchMock.mockReturnValue(jsonResponse(body))

      await expect(addToCart(selection)).rejects.toThrow(ApiError)
    },
  )
})
