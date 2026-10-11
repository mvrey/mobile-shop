export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://itx-frontend-test.onrender.com'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// The API sleeps when idle and can take up to a minute to wake up; give up after
// longer than that rather than waiting forever.
export const REQUEST_TIMEOUT_MS = 90 * 1000

// Calls the API and returns the parsed JSON body; throws ApiError on a non-2xx status
// (and the browser's TimeoutError if the API doesn't answer in time).
// Callers that send a body set their own Content-Type: a plain GET must not, or the
// browser sends an extra CORS preflight request before it.
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    ...options,
  })
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }
  return response.json()
}
