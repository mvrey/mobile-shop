// Prices are in euros. The UI is in English, so they are formatted the English
// way for a euro market (Ireland): "€170", "€99.50".
const currency = (fractionDigits) =>
  new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
const wholeEuros = currency(0)
const withCents = currency(2)

export const NO_PRICE_LABEL = 'Price not available'

// Returns e.g. "€170" or "€99.50", or null when the product has no price.
export function formatPrice(price) {
  if (price == null) return null
  return (Number.isInteger(price) ? wholeEuros : withCents).format(price)
}
