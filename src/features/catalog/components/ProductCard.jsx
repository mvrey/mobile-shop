import { Link, useLocation } from 'react-router'
import { formatPrice } from '../domain/formatPrice'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { id, brand, model, price, imageUrl } = product
  const formattedPrice = formatPrice(price)
  // Remember the list URL (including ?q=) so the details page can link back to it.
  const { pathname, search } = useLocation()

  return (
    <Link to={`/product/${id}`} state={{ from: pathname + search }} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={`${brand} ${model}`}
          width="160"
          height="212"
          loading="lazy"
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.brand}>{brand}</p>
        <h2 className={styles.model}>{model}</h2>
        <p className={formattedPrice ? styles.price : styles.noPrice}>
          {formattedPrice ?? 'Price not available'}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
