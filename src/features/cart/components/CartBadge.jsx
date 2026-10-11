import { useCart } from '../useCart'
import styles from './CartBadge.module.css'

function CartBadge() {
  const { count } = useCart()
  const label = `${count} ${count === 1 ? 'item' : 'items'} in cart`

  return (
    <div className={styles.badge} role="status" aria-label={label}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" className={styles.icon}>
        <path d="M6 6h15l-1.5 9h-12z M6 6 5 3H2 M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
      </svg>
      <span className={styles.count}>{count}</span>
    </div>
  )
}

export default CartBadge
