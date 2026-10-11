import { createCachedFetcher } from '../../../shared/api/cachedFetcher'
import { API_BASE_URL, ApiError, request } from '../../../shared/api/httpClient'
import { createStorageCache } from '../../../shared/cache/storageCache'
import { toProduct, toProductSummaries } from '../domain/product'

// The product id doesn't exist. (The API answers 500 rather than 404 for that.)
export class ProductNotFoundError extends Error {
  constructor(id) {
    super(`Product ${id} not found`)
    this.name = 'ProductNotFoundError'
    this.id = id
  }
}

const LIST_PATH = '/api/product'

// Builds the catalog API on top of a cache and an HTTP `fetchJson(path)`.
// Raw API responses are cached; mapping to the domain model happens on the way
// out, so a cached entry always has the API's shape. Entries are keyed by full
// URL, so pointing the app at another API never serves the old one's data.
export function createCatalogApi({ cache, fetchJson }) {
  const cached = createCachedFetcher({ cache })
  const cacheKey = (path) => API_BASE_URL + path
  const cachedGet = (path) => cached(cacheKey(path), () => fetchJson(path))

  /** @returns {Promise<import('../domain/product').ProductSummary[]>} */
  function getProducts() {
    return cachedGet(LIST_PATH).then(toProductSummaries)
  }

  /** @returns {Promise<import('../domain/product').Product>} */
  async function getProduct(id) {
    try {
      return toProduct(await cachedGet(`${LIST_PATH}/${encodeURIComponent(id)}`))
    } catch (error) {
      if (error instanceof ApiError && (await isMissingFromCatalog(id))) {
        throw new ProductNotFoundError(id)
      }
      throw error
    }
  }

  // The API can't tell "no such product" from a server error, so ask the product
  // list. A cached list may be older than the product, so before concluding it's
  // missing, check a fresh copy. If the list can't be loaded, we don't know.
  async function isMissingFromCatalog(id) {
    const listed = (products) => products.some((product) => product.id === id)
    try {
      const wasCached = cache.get(cacheKey(LIST_PATH)) !== undefined
      if (listed(await getProducts())) return false
      if (!wasCached) return true

      const fresh = await fetchJson(LIST_PATH)
      cache.set(cacheKey(LIST_PATH), fresh)
      return !listed(toProductSummaries(fresh))
    } catch {
      return false
    }
  }

  return { getProducts, getProduct }
}

// The app's instance: responses cached in localStorage for 1 hour.
export const { getProducts, getProduct } = createCatalogApi({
  cache: createStorageCache(),
  fetchJson: request,
})
