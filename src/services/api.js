import { getCached, setCached } from './cache'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://itx-frontend-test.onrender.com'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }
  return response.json()
}

// Requests currently on the wire, keyed like the cache. If two components ask for
// the same data at once (React StrictMode mounts effects twice in development),
// they share one request instead of firing two.
const inFlight = new Map()

function cachedRequest(key, path) {
  const cached = getCached(key)
  if (cached !== undefined) return Promise.resolve(cached)

  if (!inFlight.has(key)) {
    const promise = request(path)
      .then((data) => {
        setCached(key, data)
        return data
      })
      .finally(() => inFlight.delete(key))
    inFlight.set(key, promise)
  }
  return inFlight.get(key)
}

export function getProducts() {
  return cachedRequest('products', '/api/product')
}

export function getProduct(id) {
  return cachedRequest(`product:${id}`, `/api/product/${encodeURIComponent(id)}`)
}

// Not cached: it changes server state, and every call must reach the API.
export function addToCart({ id, colorCode, storageCode }) {
  return request('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ id, colorCode, storageCode }),
  })
}
