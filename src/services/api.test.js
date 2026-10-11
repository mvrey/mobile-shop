import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError, addToCart, getProduct, getProducts } from './api'
import { CACHE_TTL_MS } from './cache'

function jsonResponse(body, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

describe('api', () => {
  let fetchMock

  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe('getProducts', () => {
    it('fetches the product list', async () => {
      const products = [{ id: 'a', brand: 'Acer', model: 'Liquid Z6' }]
      fetchMock.mockReturnValue(jsonResponse(products))

      await expect(getProducts()).resolves.toEqual(products)
      // A plain GET with no custom headers, so the browser sends no CORS preflight.
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/product`, undefined)
    })

    it('serves repeated calls from the cache', async () => {
      fetchMock.mockReturnValue(jsonResponse([{ id: 'a' }]))

      await getProducts()
      await getProducts()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fetches again once the cache has expired', async () => {
      fetchMock.mockReturnValueOnce(jsonResponse([{ id: 'old' }]))
      fetchMock.mockReturnValueOnce(jsonResponse([{ id: 'new' }]))

      await getProducts()
      vi.advanceTimersByTime(CACHE_TTL_MS)

      await expect(getProducts()).resolves.toEqual([{ id: 'new' }])
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('shares one request between concurrent callers', async () => {
      fetchMock.mockReturnValue(jsonResponse([{ id: 'a' }]))

      const [first, second] = await Promise.all([getProducts(), getProducts()])

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('throws an ApiError with the status on a failed response, and caches nothing', async () => {
      fetchMock.mockReturnValueOnce(jsonResponse({ message: 'boom' }, 500))
      fetchMock.mockReturnValueOnce(jsonResponse([{ id: 'a' }]))

      const error = await getProducts().catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(500)

      await expect(getProducts()).resolves.toEqual([{ id: 'a' }])
    })
  })

  describe('getProduct', () => {
    it('fetches and caches each product under its own id', async () => {
      fetchMock.mockImplementation((url) => jsonResponse({ id: url.split('/').pop() }))

      await expect(getProduct('a')).resolves.toEqual({ id: 'a' })
      await expect(getProduct('b')).resolves.toEqual({ id: 'b' })
      await getProduct('a')

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/product/a`, undefined)
    })
  })

  describe('addToCart', () => {
    it('posts the selection and returns the cart count', async () => {
      fetchMock.mockReturnValue(jsonResponse({ count: 1 }))

      await expect(addToCart({ id: 'a', colorCode: 1000, storageCode: 2000 })).resolves.toEqual({
        count: 1,
      })
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/cart`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'a', colorCode: 1000, storageCode: 2000 }),
        }),
      )
    })

    it.each([{}, { count: 'one' }, { count: -1 }, null])(
      'rejects a response without a valid count: %j',
      async (body) => {
        fetchMock.mockReturnValue(jsonResponse(body))

        await expect(addToCart({ id: 'a', colorCode: 1000, storageCode: 2000 })).rejects.toThrow(
          ApiError,
        )
      },
    )

    it('is never cached', async () => {
      fetchMock.mockImplementation(() => jsonResponse({ count: 1 }))

      await addToCart({ id: 'a', colorCode: 1000, storageCode: 2000 })
      await addToCart({ id: 'a', colorCode: 1000, storageCode: 2000 })

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })
})
