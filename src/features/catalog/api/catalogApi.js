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

// Raw API responses are cached (for 1 hour); mapping to the domain model happens
// on the way out, so a cached entry always has the API's shape. Entries are keyed
// by full URL, so pointing the app at another API never serves the old one's data.
const cache = createStorageCache()
cache.prune()
const cached = createCachedFetcher({ cache })

function cachedGet(path) {
  return cached(API_BASE_URL + path, () => request(path))
}

/** @returns {Promise<import('../domain/product').ProductSummary[]>} */
export function getProducts() {
  return cachedGet('/api/product').then(toProductSummaries)
}

/** @returns {Promise<import('../domain/product').Product>} */
export async function getProduct(id) {
  try {
    return toProduct(await cachedGet(`/api/product/${encodeURIComponent(id)}`))
  } catch (error) {
    if (error instanceof ApiError && (await isMissingFromCatalog(id))) {
      throw new ProductNotFoundError(id)
    }
    throw error
  }
}

// The API can't tell "no such product" from a server error, so ask the product
// list (usually already cached). If the list can't be loaded either, we don't know.
async function isMissingFromCatalog(id) {
  try {
    const products = await getProducts()
    return !products.some((product) => product.id === id)
  } catch {
    return false
  }
}
