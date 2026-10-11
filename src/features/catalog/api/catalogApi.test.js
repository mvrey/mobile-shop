import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError } from '../../../shared/api/httpClient'
import { CACHE_TTL_MS } from '../../../shared/cache/storageCache'
import { iconiaTalkS } from '../../../test/fixtures'
import { getProduct, getProducts } from './catalogApi'

function jsonResponse(body, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

const listItem = (id) => ({ id, brand: 'Acer', model: id, price: '100', imgUrl: `/${id}.jpg` })

describe('catalogApi', () => {
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
    it('fetches the product list and maps it to the domain model', async () => {
      fetchMock.mockReturnValue(jsonResponse([listItem('a')]))

      await expect(getProducts()).resolves.toEqual([
        { id: 'a', brand: 'Acer', model: 'a', price: 100, imageUrl: '/a.jpg' },
      ])
      // A plain GET with no custom headers, so the browser sends no CORS preflight.
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/product`, undefined)
    })

    it('serves repeated calls from the cache', async () => {
      fetchMock.mockReturnValue(jsonResponse([listItem('a')]))

      await getProducts()
      await getProducts()

      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fetches again once the cache has expired', async () => {
      fetchMock.mockReturnValueOnce(jsonResponse([listItem('old')]))
      fetchMock.mockReturnValueOnce(jsonResponse([listItem('new')]))

      await getProducts()
      vi.advanceTimersByTime(CACHE_TTL_MS)

      const products = await getProducts()
      expect(products.map((product) => product.id)).toEqual(['new'])
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('throws an ApiError with the status on a failed response, and caches nothing', async () => {
      fetchMock.mockReturnValueOnce(jsonResponse({ message: 'boom' }, 500))
      fetchMock.mockReturnValueOnce(jsonResponse([listItem('a')]))

      const error = await getProducts().catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(500)

      await expect(getProducts()).resolves.toHaveLength(1)
    })
  })

  describe('getProduct', () => {
    it('fetches and caches each product under its own id', async () => {
      fetchMock.mockImplementation((url) =>
        jsonResponse({ ...iconiaTalkS, id: url.split('/').pop() }),
      )

      await expect(getProduct('a')).resolves.toMatchObject({ id: 'a', model: 'Iconia Talk S' })
      await expect(getProduct('b')).resolves.toMatchObject({ id: 'b' })
      await getProduct('a')

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/product/a`, undefined)
    })
  })
})
