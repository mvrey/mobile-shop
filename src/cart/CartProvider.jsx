import { useCallback, useMemo, useState } from 'react'
import { CartContext } from './CartContext'

const STORAGE_KEY = 'mobile-shop:cart-count'

function readStoredCount() {
  try {
    const count = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isInteger(count) && count > 0 ? count : 0
  } catch {
    return 0
  }
}

// Holds the number of items in the cart and persists it, so the header shows
// the right count on every view and after a page reload.
export function CartProvider({ children }) {
  const [count, setCount] = useState(readStoredCount)

  const addItems = useCallback((quantity) => {
    setCount((previous) => {
      const next = previous + quantity
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // Storage unavailable: the count still works for this session.
      }
      return next
    })
  }, [])

  const value = useMemo(() => ({ count, addItems }), [count, addItems])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
