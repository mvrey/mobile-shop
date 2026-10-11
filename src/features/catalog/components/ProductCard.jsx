import { Link, useLocation } from 'react-router'
import { NO_PRICE_LABEL, formatPrice } from '../domain/formatPrice'
import ProductImage from './ProductImage'
import styles from './ProductCard.module.css'

/** @param {{ product: import('../domain/product').ProductSummary }} props */
function ProductCard({ product }) {
  const { id, brand, model, price } = product
  const formattedPrice = formatPrice(price)
  // Remember the list URL (including ?q=) so the details page can link back to it.
  const { pathname, search } = useLocation()

  return (
    <Link to={`/product/${id}`} state={{ from: pathname + search }} className={styles.card}>
      <div className={styles.imageWrap}>
        <ProductImage product={product} loading="lazy" className={styles.image} />
      </div>
      <div className={styles.body}>
        <p className={styles.brand}>{brand}</p>
        <h2 className={styles.model}>{model}</h2>
        <p className={formattedPrice ? styles.price : styles.noPrice}>
          {formattedPrice ?? NO_PRICE_LABEL}
        </p>
      </div>
    </Link>
  )
}

export default ProductCard
