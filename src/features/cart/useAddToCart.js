import { useCallback, useState } from 'react'
import { useCart } from './useCart'

// Adds a selection to the cart and tracks how it went, for the UI to report:
// status is 'idle' | 'adding' | 'added' | 'error'.
export function useAddToCart() {
  const { addToCart } = useCart()
  const [status, setStatus] = useState('idle')

  const add = useCallback(
    async (selection) => {
      setStatus('adding')
      try {
        await addToCart(selection)
        setStatus('added')
      } catch {
        setStatus('error')
      }
    },
    [addToCart],
  )

  // Clears a previous "added"/"error" outcome (not an add in progress).
  const reset = useCallback(() => {
    setStatus((current) => (current === 'adding' ? current : 'idle'))
  }, [])

  return { status, add, reset }
}
