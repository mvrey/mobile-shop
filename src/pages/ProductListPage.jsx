import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { useProducts } from '../hooks/useProducts'
import { filterProducts } from '../products/filterProducts'
import styles from './ProductListPage.module.css'

function ProductListPage() {
  const { data: products, error, loading, retry } = useProducts()

  // The query lives in the URL (?q=...), so it survives going to a product and back.
  // The input keeps its own state so typing stays instant.
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')

  const handleQueryChange = (value) => {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const visibleProducts = useMemo(
    () => (products ? filterProducts(products, query) : []),
    [products, query],
  )

  return (
    <section>
      <title>Products | Mobile Shop</title>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.title}>Products</h1>
          {products && (
            <p className={styles.count} aria-live="polite">
              {visibleProducts.length} of {products.length} products
            </p>
          )}
        </div>
        <SearchBar value={query} onChange={handleQueryChange} />
      </div>

      {loading && <LoadingState message="Loading products…" />}
      {error && <ErrorState message="We couldn't load the products." onRetry={retry} />}

      {products &&
        (visibleProducts.length > 0 ? (
          <ul className={styles.grid}>
            {visibleProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No products match “{query.trim()}”.</p>
        ))}
    </section>
  )
}

export default ProductListPage
