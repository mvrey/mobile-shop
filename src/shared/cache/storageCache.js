import { safeStorage } from '../storage/safeStorage'

export const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Key/value cache with expiry, persisted in `storage` so it survives page reloads.
// Each entry is stored as { value, expiresAt } and dropped once it is older than
// the TTL. Dependencies are parameters so tests (or another backend, e.g. an
// in-memory one) can be plugged in.
export function createStorageCache({
  storage = safeStorage,
  namespace = 'cache',
  ttlMs = CACHE_TTL_MS,
  now = () => Date.now(),
} = {}) {
  const prefix = `${namespace}:`
  const storageKey = (key) => prefix + key

  // Returns the cached value, or undefined if missing, expired or corrupt.
  function get(key) {
    const raw = storage.get(storageKey(key))
    if (!raw) return undefined

    try {
      const { value, expiresAt } = JSON.parse(raw)
      if (now() < expiresAt) return value
    } catch {
      // Corrupt entry: treat it as a miss and drop it below.
    }
    storage.remove(storageKey(key))
    return undefined
  }

  function set(key, value) {
    storage.set(storageKey(key), JSON.stringify({ value, expiresAt: now() + ttlMs }))
  }

  // Drops every expired or corrupt entry. `get` only cleans up the keys it is
  // asked for, so entries for pages never visited again would otherwise stay.
  function prune() {
    for (const key of storage.keys()) {
      if (key.startsWith(prefix)) get(key.slice(prefix.length))
    }
  }

  return { get, set, prune }
}
