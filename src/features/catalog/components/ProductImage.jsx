import { productName } from '../domain/product'

// The API's product images are all 160×212. Declaring that size lets the browser
// reserve the space before the image loads (no layout shift); CSS scales it.
const WIDTH = 160
const HEIGHT = 212

function ProductImage({ product, className, loading }) {
  return (
    <img
      src={product.imageUrl}
      alt={productName(product)}
      width={WIDTH}
      height={HEIGHT}
      loading={loading}
      className={className}
    />
  )
}

export default ProductImage
