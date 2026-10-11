import { useCallback, useEffect, useMemo, useState } from 'react'
import { safeStorage } from '../../shared/storage/safeStorage'
import { addToCart as addToCartRequest } from './api/cartApi'
import { CartContext } from './CartContext'

const STORAGE_KEY = 'cart-count'

function parseCount(value) {
  const count = Number(value)
  return Number.isInteger(count) && count > 0 ? count : 0
}

const readStoredCount = () => parseCount(safeStorage.get(STORAGE_KEY))

// Owns the cart: the number of items in it, and the "add to cart" operation.
// The count is persisted, so the header shows it on every view and after a reload.
//
// The API's response count is treated as "items just added" (its mock always
// answers 1), and the running total is kept here.
//
// `request` is the API call; tests can pass a fake one.
export function CartProvider({ children, request = addToCartRequest }) {
  const [count, setCount] = useState(readStoredCount)

  // Persisting is a side effect, so it lives here and not in the state updater
  // (React may call updaters more than once).
  useEffect(() => {
    safeStorage.set(STORAGE_KEY, String(count))
  }, [count])

  // Follow adds made in other tabs, so each tab adds to the latest total instead
  // of overwriting it with its own stale one.
  useEffect(() => safeStorage.subscribe(STORAGE_KEY, (value) => setCount(parseCount(value))), [])

  const addToCart = useCallback(
    async (selection) => {
      const { count: added } = await request(selection)
      setCount((previous) => previous + added)
    },
    [request],
  )

  const value = useMemo(() => ({ count, addToCart }), [count, addToCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
