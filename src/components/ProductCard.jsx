import { Link } from 'react-router'
import { formatPrice } from '../products/formatPrice'
import styles from './ProductCard.module.css'

function ProductCard({ product }) {
  const { id, brand, model, price, imgUrl } = product
  const formattedPrice = formatPrice(price)

  return (
    <Link to={`/product/${id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={imgUrl}
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
