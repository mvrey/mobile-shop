import { useCallback, useEffect, useMemo, useState } from 'react'
import { safeStorage } from '../../shared/storage/safeStorage'
import { addToCart as addToCartRequest } from './api/cartApi'
import { CartContext } from './CartContext'

const STORAGE_KEY = 'cart-count'

function readStoredCount() {
  const count = Number(safeStorage.get(STORAGE_KEY))
  return Number.isInteger(count) && count > 0 ? count : 0
}

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
