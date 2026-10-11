// Wraps loads in a cache: `cached(key, load)` returns the cached value when there
// is one, otherwise calls `load()` and caches what it resolves to. Failures are
// not cached, so the next call tries again.
//
// Concurrent calls for the same key share one load. (React StrictMode mounts
// effects twice in development, and the breadcrumb and the details page ask for
// the same product at once.)
export function createCachedFetcher({ cache }) {
  const inFlight = new Map()

  return function cached(key, load) {
    const hit = cache.get(key)
    if (hit !== undefined) return Promise.resolve(hit)

    if (!inFlight.has(key)) {
      const promise = load()
        .then((value) => {
          cache.set(key, value)
          return value
        })
        .finally(() => inFlight.delete(key))
      inFlight.set(key, promise)
    }
    return inFlight.get(key)
  }
}
