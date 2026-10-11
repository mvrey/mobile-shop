import { useState } from 'react'
import OptionSelector from '../../../shared/ui/OptionSelector'
import { useAddToCart } from '../useAddToCart'
import styles from './ProductActions.module.css'

/**
 * @typedef {object} CartOption  A choice the cart API accepts for a product.
 * @property {number} code  Sent to the cart API.
 * @property {string} name  Shown to the user.
 */

// When there is a single option, it is selected from the start.
const initialSelection = (options) => (options.length === 1 ? options[0].code : null)

/**
 * @param {{ productId: string, storages: CartOption[], colors: CartOption[] }} props
 */
function ProductActions({ productId, storages, colors }) {
  const [storageCode, setStorageCode] = useState(() => initialSelection(storages))
  const [colorCode, setColorCode] = useState(() => initialSelection(colors))
  const { status, add, reset } = useAddToCart()

  const available = storages.length > 0 && colors.length > 0
  const canAdd = storageCode !== null && colorCode !== null && status !== 'adding'

  const handleSubmit = (event) => {
    event.preventDefault()
    if (canAdd) add({ id: productId, colorCode, storageCode })
  }

  // Changing a selection clears the previous "added"/"error" message.
  const select = (setter) => (code) => {
    setter(code)
    reset()
  }

  return (
    <form className={styles.actions} onSubmit={handleSubmit} aria-label="Add to cart">
      <OptionSelector
        label="Storage"
        name="storage"
        options={storages}
        selected={storageCode}
        onSelect={select(setStorageCode)}
      />
      <OptionSelector
        label="Color"
        name="color"
        options={colors}
        selected={colorCode}
        onSelect={select(setColorCode)}
      />

      <button type="submit" className={`button ${styles.submit}`} disabled={!canAdd}>
        {status === 'adding' ? 'Adding…' : 'Add to cart'}
      </button>

      <p className={styles.feedback} role="status">
        {!available && 'This product is currently unavailable.'}
        {available && status === 'idle' && !canAdd && 'Choose a storage and a color.'}
        {status === 'added' && 'Added to your cart.'}
        {status === 'error' && (
          <span className={styles.error}>We couldn't add it to your cart. Please try again.</span>
        )}
      </p>
    </form>
  )
}

export default ProductActions
