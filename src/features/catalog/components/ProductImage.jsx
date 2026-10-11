import { useState } from 'react'
import { productName } from '../domain/product'
import placeholder from './product-placeholder.svg'

// The API's product images are all 160×212. Declaring that size lets the browser
// reserve the space before the image loads (no layout shift); CSS scales it.
const WIDTH = 160
const HEIGHT = 212

/**
 * @param {{
 *   product: import('../domain/product').ProductSummary,
 *   className?: string,
 *   loading?: 'lazy' | 'eager',
 * }} props
 */
function ProductImage({ product, className, loading }) {
  // If the image fails to load, show a neutral placeholder instead of the
  // browser's broken-image icon. Remembering *which* URL failed means a new
  // product (a new URL) gets a fresh try.
  const [failedUrl, setFailedUrl] = useState(null)
  const failed = failedUrl === product.imageUrl

  return (
    <img
      src={failed ? placeholder : product.imageUrl}
      alt={productName(product)}
      width={WIDTH}
      height={HEIGHT}
      loading={loading}
      className={className}
      onError={() => setFailedUrl(product.imageUrl)}
    />
  )
}

export default ProductImage
