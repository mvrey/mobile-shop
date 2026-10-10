import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <>
      <title>Page not found | Mobile Shop</title>
      <h1>Page not found</h1>
      <p>
        The page you are looking for does not exist. <Link to="/">Back to products</Link>
      </p>
    </>
  )
}

export default NotFoundPage
