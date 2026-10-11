import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import styles from './RouteErrorPage.module.css'

// Last-resort screen if rendering a page throws (a bug, unexpected API data...).
// It replaces the whole layout, so it keeps its own way back home.
function RouteErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className={styles.page}>
      <title>Something went wrong | Mobile Shop</title>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred while showing this page.</p>
      <Link to="/" className="button">
        Back to products
      </Link>
    </main>
  )
}

export default RouteErrorPage
