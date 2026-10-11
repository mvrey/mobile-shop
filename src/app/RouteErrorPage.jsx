import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import styles from './RouteErrorPage.module.css'

// Shown in place of a page whose rendering throws (a bug, unexpected API data...).
function RouteErrorPage() {
  const error = useRouteError()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className={styles.page}>
      <title>Something went wrong | Mobile Shop</title>
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred while showing this page.</p>
      <Link to="/" className="button">
        Back to products
      </Link>
    </div>
  )
}

export default RouteErrorPage
