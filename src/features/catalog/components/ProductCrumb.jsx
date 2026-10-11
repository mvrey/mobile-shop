import { productName } from '../domain/product'
import { useProduct } from '../hooks/useProduct'

// Breadcrumb label for a product page: its name once known, a generic label before.
// The details page asks for the same product, so this shares its (cached) request.
function ProductCrumb({ id }) {
  const { data: product } = useProduct(id)
  return product ? productName(product) : 'Product details'
}

export default ProductCrumb
