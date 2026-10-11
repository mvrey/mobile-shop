import { useMemo, useState } from 'react'
import { useLocation, useNavigationType, useSearchParams } from 'react-router'
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue'
import ErrorState from '../../../shared/ui/ErrorState'
import LoadingState from '../../../shared/ui/LoadingState'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import { useProducts } from '../hooks/useProducts'
import { filterProducts } from '../domain/filterProducts'
import styles from './ProductListPage.module.css'

const ANNOUNCE_DELAY_MS = 600

function ProductListPage() {
  const { data: products, error, loading, retry } = useProducts()

  // The query lives in the URL (?q=...), so it survives going to a product and back.
  // The input keeps its own state so typing stays instant: URL updates land
  // asynchronously, and binding the input to them could drop keystrokes.
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(urlQuery)

  // Our own updates replace the history entry. Any other navigation that lands
  // here while mounted (e.g. clicking the app title) sets the query from the URL.
  const location = useLocation()
  const navigationType = useNavigationType()
  const [seenLocationKey, setSeenLocationKey] = useState(location.key)
  if (location.key !== seenLocationKey) {
    setSeenLocationKey(location.key)
    if (navigationType !== 'REPLACE') setQuery(urlQuery)
  }

  const handleQueryChange = (value) => {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
  }

  const visibleProducts = useMemo(
    () => (products ? filterProducts(products, query) : []),
    [products, query],
  )

  // Screen readers hear the result count once typing pauses, not on every keystroke.
  const resultsSummary = products
    ? `Showing ${visibleProducts.length} of ${products.length} products.`
    : ''
  const announcedSummary = useDebouncedValue(resultsSummary, ANNOUNCE_DELAY_MS)

  return (
    <section>
      <title>Products | Mobile Shop</title>
      <div className={styles.toolbar}>
        <div>
          <h1 className={styles.title}>Products</h1>
          {products && (
            <p className={styles.count}>
              {visibleProducts.length} of {products.length} products
            </p>
          )}
          <p className="visually-hidden" aria-live="polite">
            {announcedSummary}
          </p>
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
