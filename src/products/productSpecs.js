import { formatPrice } from './formatPrice'

// Some API fields are a string, others an array of strings (sometimes with
// empty entries). Normalise both to a single readable string.
function toText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return value ?? ''
}

function withUnit(value, unit) {
  const text = toText(value)
  return text ? `${text} ${unit}` : ''
}

// Builds the list of { label, value } rows shown in the product description,
// skipping attributes the API left empty.
//
// Note: the API has `displayResolution` and `displaySize` swapped
// (displayResolution = "5.5 inches", displaySize = "720 x 1280 pixels"),
// so each one is labelled by what it actually contains.
export function productSpecs(product) {
  const rows = [
    { label: 'Brand', value: product.brand },
    { label: 'Model', value: product.model },
    { label: 'Price', value: formatPrice(product.price) ?? 'Not available' },
    { label: 'CPU', value: toText(product.cpu) },
    { label: 'RAM', value: toText(product.ram) },
    { label: 'Operating system', value: toText(product.os) },
    { label: 'Screen size', value: toText(product.displayResolution) },
    { label: 'Screen resolution', value: toText(product.displaySize) },
    { label: 'Battery', value: toText(product.battery) },
    { label: 'Main camera', value: toText(product.primaryCamera) },
    { label: 'Front camera', value: toText(product.secondaryCmera) },
    { label: 'Dimensions', value: toText(product.dimentions) },
    { label: 'Weight', value: withUnit(product.weight, 'g') },
  ]
  return rows.filter((row) => row.value)
}
