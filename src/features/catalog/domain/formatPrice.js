const formatter = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
})

// Returns e.g. "170 €", or null when the product has no price.
export function formatPrice(price) {
  return price == null ? null : formatter.format(price)
}
