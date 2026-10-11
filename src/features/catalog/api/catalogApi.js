import { createCachedFetcher } from '../../../shared/api/cachedFetcher'
import { request } from '../../../shared/api/httpClient'
import { createStorageCache } from '../../../shared/cache/storageCache'
import { toProduct, toProductSummaries } from '../domain/product'

// Raw API responses are cached (for 1 hour); mapping to the domain model happens
// on the way out, so a cached entry always has the API's shape.
const cached = createCachedFetcher({ cache: createStorageCache() })

/** @returns {Promise<import('../domain/product').ProductSummary[]>} */
export function getProducts() {
  return cached('products', () => request('/api/product')).then(toProductSummaries)
}

/** @returns {Promise<import('../domain/product').Product>} */
export function getProduct(id) {
  return cached(`product:${id}`, () => request(`/api/product/${encodeURIComponent(id)}`)).then(
    toProduct,
  )
}
