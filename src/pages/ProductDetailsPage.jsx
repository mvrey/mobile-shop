import { Link, useLocation, useParams } from 'react-router'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import ProductActions from '../components/ProductActions'
import { useProduct } from '../hooks/useProduct'
import { formatPrice } from '../products/formatPrice'
import { productSpecs } from '../products/productSpecs'
import styles from './ProductDetailsPage.module.css'

function ProductDetailsPage() {
  const { id } = useParams()
  const { data: product, error, loading, retry } = useProduct(id)

  // The product list passes its URL (with the search) so "Back" restores it.
  const location = useLocation()
  const backTo = location.state?.from ?? '/'

  const title = product ? `${product.brand} ${product.model}` : 'Product'

  return (
    <article>
      <title>{`${title} | Mobile Shop`}</title>
      <Link to={backTo} className={styles.back}>
        ← Back to products
      </Link>

      {loading && <LoadingState message="Loading product…" />}
      {error && <ErrorState message="We couldn't load this product." onRetry={retry} />}

      {product && (
        <div className={styles.columns}>
          <div className={styles.imagePanel}>
            <img
              src={product.imgUrl}
              alt={`${product.brand} ${product.model}`}
              width="160"
              height="212"
              className={styles.image}
            />
          </div>

          <div className={styles.info}>
            <section className={styles.panel} aria-labelledby="product-title">
              <p className={styles.brand}>{product.brand}</p>
              <h1 id="product-title" className={styles.title}>
                {product.model}
              </h1>
              <p className={styles.price}>{formatPrice(product.price) ?? 'Price not available'}</p>

              <h2 className={styles.sectionTitle}>Specifications</h2>
              <dl className={styles.specs}>
                {productSpecs(product).map(({ label, value }) => (
                  <div key={label} className={styles.specRow}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.panel}>
              {/* key: a different product starts with fresh selections */}
              <ProductActions key={product.id} product={product} />
            </section>
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductDetailsPage
