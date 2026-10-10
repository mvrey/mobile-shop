// Client-side cache for API responses, backed by localStorage.
// Each entry is stored as { value, expiresAt } so it survives page reloads
// and is revalidated once it is older than the TTL.

export const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const KEY_PREFIX = 'mobile-shop:cache:'

export function getCached(key) {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + key)
    if (!raw) return undefined

    const { value, expiresAt } = JSON.parse(raw)
    if (Date.now() >= expiresAt) {
      localStorage.removeItem(KEY_PREFIX + key)
      return undefined
    }
    return value
  } catch {
    // Corrupt entry or storage unavailable (e.g. private mode): treat as a miss.
    return undefined
  }
}

export function setCached(key, value, ttlMs = CACHE_TTL_MS) {
  try {
    const entry = { value, expiresAt: Date.now() + ttlMs }
    localStorage.setItem(KEY_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Quota exceeded or storage unavailable: the app still works, just uncached.
  }
}
