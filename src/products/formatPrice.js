const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
})

// The API sends prices as strings, and some are empty.
// Returns e.g. "170 €", or null when there is no usable price.
export function formatPrice(price) {
  if (price === '' || price == null) return null
  const amount = Number(price)
  return Number.isFinite(amount) ? formatter.format(amount) : null
}
