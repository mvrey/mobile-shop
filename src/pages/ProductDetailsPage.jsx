import { useParams } from 'react-router'

function ProductDetailsPage() {
  const { id } = useParams()
  return <h1>Product {id}</h1>
}

export default ProductDetailsPage
