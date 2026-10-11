import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError } from '../../../shared/api/httpClient'
import { CACHE_TTL_MS } from '../../../shared/cache/storageCache'
import { iconiaTalkS } from '../../../test/fixtures'
import { ProductNotFoundError, createCatalogApi, getProduct, getProducts } from './catalogApi'

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
      const [url, options] = fetchMock.mock.calls[0]
      expect(url).toBe(`${API_BASE_URL}/api/product`)
      // A plain GET with no custom headers, so the browser sends no CORS preflight.
      expect(options.headers).toBeUndefined()
      expect(options.method).toBeUndefined()
    })

    it('caches under the full URL, so another API never gets this data', async () => {
      fetchMock.mockReturnValue(jsonResponse([listItem('a')]))

      await getProducts()

      expect(localStorage.getItem(`mobile-shop:cache:${API_BASE_URL}/api/product`)).not.toBeNull()
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
      expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/api/product/a`)
    })

    // The API answers 500 for an unknown id; the product list tells the two cases apart.
    it('reports a product that is not in the catalog as not found', async () => {
      fetchMock.mockImplementation((url) =>
        url.endsWith('/api/product') ? jsonResponse([listItem('a')]) : jsonResponse({}, 500),
      )

      await expect(getProduct('missing')).rejects.toBeInstanceOf(ProductNotFoundError)
    })

    it('keeps the server error when the product is in the catalog', async () => {
      fetchMock.mockImplementation((url) =>
        url.endsWith('/api/product') ? jsonResponse([listItem('a')]) : jsonResponse({}, 500),
      )

      const error = await getProduct('a').catch((e) => e)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(500)
    })

    it('keeps the server error when the catalog cannot be checked', async () => {
      fetchMock.mockImplementation(() => jsonResponse({}, 500))

      await expect(getProduct('a')).rejects.toBeInstanceOf(ApiError)
    })
  })

  // Built with an in-memory cache and a fake HTTP call: no fetch, no localStorage.
  describe('createCatalogApi', () => {
    function memoryCache() {
      const entries = new Map()
      return { get: (key) => entries.get(key), set: (key, value) => entries.set(key, value) }
    }

    it('checks a fresh product list before saying a product does not exist', async () => {
      const lists = [[listItem('old')], [listItem('old'), listItem('new')]]
      const fetchJson = vi.fn((path) =>
        path === '/api/product'
          ? Promise.resolve(lists.shift())
          : Promise.reject(new ApiError('boom', 500)),
      )
      const api = createCatalogApi({ cache: memoryCache(), fetchJson })
      await api.getProducts() // caches the list from before 'new' existed

      const error = await api.getProduct('new').catch((e) => e)

      expect(error).toBeInstanceOf(ApiError) // listed in the fresh list: a real server error
      expect((await api.getProducts()).map((product) => product.id)).toEqual(['old', 'new'])
    })

    it('peeks at cached data synchronously, mapped to the domain model', async () => {
      const fetchJson = vi.fn(() => Promise.resolve([listItem('a')]))
      const api = createCatalogApi({ cache: memoryCache(), fetchJson })

      expect(api.peekProducts()).toBeUndefined()
      await api.getProducts()

      expect(api.peekProducts()).toEqual([
        { id: 'a', brand: 'Acer', model: 'a', price: 100, imageUrl: '/a.jpg' },
      ])
      expect(api.peekProduct('a')).toBeUndefined()
    })

    it('treats an unusable cached entry as a miss when peeking', () => {
      const cache = memoryCache()
      cache.set(`${API_BASE_URL}/api/product`, { not: 'a list' })
      const api = createCatalogApi({ cache, fetchJson: vi.fn() })

      expect(api.peekProducts()).toBeUndefined()
    })

    it('does not fetch the list twice when it was not cached yet', async () => {
      const fetchJson = vi.fn((path) =>
        path === '/api/product'
          ? Promise.resolve([listItem('a')])
          : Promise.reject(new ApiError('boom', 500)),
      )
      const api = createCatalogApi({ cache: memoryCache(), fetchJson })

      await expect(api.getProduct('missing')).rejects.toBeInstanceOf(ProductNotFoundError)
      expect(fetchJson.mock.calls.filter(([path]) => path === '/api/product')).toHaveLength(1)
    })
  })
})
