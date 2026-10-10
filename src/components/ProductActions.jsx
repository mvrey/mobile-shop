import { useState } from 'react'
import { useCart } from '../cart/useCart'
import { addToCart } from '../services/api'
import OptionSelector from './OptionSelector'
import styles from './ProductActions.module.css'

// When there is a single option, it is selected from the start.
const initialSelection = (options) => (options.length === 1 ? options[0].code : null)

function ProductActions({ product }) {
  const { colors, storages } = product.options
  const [storageCode, setStorageCode] = useState(() => initialSelection(storages))
  const [colorCode, setColorCode] = useState(() => initialSelection(colors))
  const [status, setStatus] = useState('idle') // idle | adding | added | error
  const { addItems } = useCart()

  const canAdd = storageCode !== null && colorCode !== null && status !== 'adding'

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canAdd) return

    setStatus('adding')
    try {
      const { count } = await addToCart({ id: product.id, colorCode, storageCode })
      addItems(count)
      setStatus('added')
    } catch {
      setStatus('error')
    }
  }

  // Changing a selection clears the previous "added"/"error" message.
  const select = (setter) => (code) => {
    setter(code)
    if (status !== 'adding') setStatus('idle')
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
        {status === 'idle' && !canAdd && 'Choose a storage and a color.'}
        {status === 'added' && 'Added to your cart.'}
        {status === 'error' && (
          <span className={styles.error}>We couldn't add it to your cart. Please try again.</span>
        )}
      </p>
    </form>
  )
}

export default ProductActions
