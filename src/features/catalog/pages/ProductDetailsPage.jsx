import { useId } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import ErrorState from '../../../shared/ui/ErrorState'
import LoadingState from '../../../shared/ui/LoadingState'
import { ProductNotFoundError } from '../api/catalogApi'
import ProductImage from '../components/ProductImage'
import { productName } from '../domain/product'
import { productSpecs } from '../domain/productSpecs'
import { useProduct } from '../hooks/useProduct'
import styles from './ProductDetailsPage.module.css'

// `renderActions(product)` renders the purchase form (the ACTIONS panel). The app
// supplies it, so the catalog doesn't depend on the cart.
/** @param {{ renderActions?: (product: import('../domain/product').Product) => import('react').ReactNode }} props */
function ProductDetailsPage({ renderActions }) {
  const { id } = useParams()
  const { data: product, error, loading, retry } = useProduct(id)
  const titleId = useId()

  // The product list passes its URL (with the search) so "Back" restores it.
  const location = useLocation()
  const backTo = location.state?.from ?? '/'

  const notFound = error instanceof ProductNotFoundError
  const title = product ? productName(product) : notFound ? 'Product not found' : 'Product'

  return (
    <article>
      <title>{`${title} | Mobile Shop`}</title>
      <Link to={backTo} className={styles.back}>
        ← Back to products
      </Link>

      {loading && <LoadingState message="Loading product…" />}
      {/* Retrying can't make a missing product appear, so only offer it for other errors. */}
      {notFound && <ErrorState message="This product doesn't exist." />}
      {error && !notFound && (
        <ErrorState message="We couldn't load this product." onRetry={retry} />
      )}

      {product && (
        <div className={styles.columns}>
          <div className={styles.imagePanel}>
            <ProductImage product={product} className={styles.image} />
          </div>

          <div className={styles.info}>
            <section className={styles.panel} aria-labelledby={titleId}>
              <p className={styles.brand}>{product.brand}</p>
              <h1 id={titleId} className={styles.title}>
                {product.model}
              </h1>

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

            {renderActions && <section className={styles.panel}>{renderActions(product)}</section>}
          </div>
        </div>
      )}
    </article>
  )
}

export default ProductDetailsPage
