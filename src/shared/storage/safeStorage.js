// localStorage wrapper for the whole app: namespaces every key and never throws.
// Storage can be unavailable (private mode, blocked cookies) or full; the app
// must keep working without it, just without persistence.

const PREFIX = 'mobile-shop:'

export const safeStorage = {
  // Returns the stored string, or null if missing or storage is unavailable.
  get(key) {
    try {
      return localStorage.getItem(PREFIX + key)
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value)
    } catch {
      // Quota exceeded or storage unavailable: nothing is persisted.
    }
  },

  // Every key the app has stored (without the prefix).
  keys() {
    try {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(PREFIX))
        .map((key) => key.slice(PREFIX.length))
    } catch {
      return []
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
}
