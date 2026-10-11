import { ApiError, request } from '../../../shared/api/httpClient'

/**
 * @typedef {object} CartSelection
 * @property {string} id  Product id.
 * @property {number} colorCode
 * @property {number} storageCode
 */

// Not cached: it changes server state, and every call must reach the API.
/** @param {CartSelection} selection @returns {Promise<{ count: number }>} */
export async function addToCart({ id, colorCode, storageCode }) {
  const response = await request('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, colorCode, storageCode }),
  })
  if (!Number.isInteger(response?.count) || response.count < 0) {
    throw new ApiError('Unexpected response from /api/cart')
  }
  return { count: response.count }
}
