export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://itx-frontend-test.onrender.com'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Calls the API and returns the parsed JSON body; throws ApiError on a non-2xx status.
// Callers that send a body set their own Content-Type: a plain GET must not, or the
// browser sends an extra CORS preflight request before it.
export async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with status ${response.status}`, response.status)
  }
  return response.json()
}
