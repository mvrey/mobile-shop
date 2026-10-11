import { NO_PRICE_LABEL, formatPrice } from './formatPrice'

// Builds the list of { label, value } rows shown in the product description,
// skipping attributes the API left empty.
export function productSpecs(product) {
  const rows = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Price', value: formatPrice(product.price) ?? NO_PRICE_LABEL },
    { label: 'CPU', value: product.cpu },
    { label: 'RAM', value: product.ram },
    { label: 'Operating system', value: product.os },
    { label: 'Screen size', value: product.screenSize },
    { label: 'Screen resolution', value: product.screenResolution },
    { label: 'Battery', value: product.battery },
    { label: 'Main camera', value: product.primaryCamera },
    { label: 'Front camera', value: product.secondaryCamera },
    { label: 'Dimensions', value: product.dimensions },
    { label: 'Weight', value: product.weight && `${product.weight} g` },
  ]
  return rows.filter((row) => row.value)
}
