// The app's own product model, and the mappers that build it from API responses.
// API quirks are fixed here, once, so the rest of the app never sees them:
// misspelled fields (secondaryCmera, dimentions), swapped display fields, prices
// as strings (sometimes empty), and attributes that are a string for some
// products and an array for others.

/**
 * @typedef {object} ProductSummary  What the product list shows.
 * @property {string} id
 * @property {string} brand
 * @property {string} model
 * @property {number | null} price  In euros; null when the API has no price.
 * @property {string} imageUrl
 */

/**
 * @typedef {object} ProductOption
 * @property {number} code  Sent to the cart API.
 * @property {string} name  Shown to the user.
 */

/**
 * @typedef {ProductSummary & {
 *   cpu: string, ram: string, os: string,
 *   screenSize: string, screenResolution: string, battery: string,
 *   primaryCamera: string, secondaryCamera: string,
 *   dimensions: string, weight: string,
 *   options: { colors: ProductOption[], storages: ProductOption[] },
 * }} Product  Full details. Text attributes are '' when the API has no value.
 */

// "13 MP" or ["13 MP", "autofocus", ""] → "13 MP" or "13 MP, autofocus".
function toText(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ')
  return value == null ? '' : String(value)
}

function toPrice(value) {
  if (value === '' || value == null) return null
  const amount = Number(value)
  return Number.isFinite(amount) ? amount : null
}

function toOptions(options) {
  return Array.isArray(options) ? options : []
}

/** @returns {ProductSummary} */
export function toProductSummary(dto) {
  return {
    id: dto.id,
    brand: toText(dto.brand),
    model: toText(dto.model),
    price: toPrice(dto.price),
    imageUrl: dto.imgUrl,
  }
}

/** @returns {ProductSummary[]} */
export function toProductSummaries(dtos) {
  if (!Array.isArray(dtos)) throw new TypeError('Expected a list of products')
  return dtos.map(toProductSummary)
}

/** @returns {Product} */
export function toProduct(dto) {
  return {
    ...toProductSummary(dto),
    cpu: toText(dto.cpu),
    ram: toText(dto.ram),
    os: toText(dto.os),
    // Swapped in the API: displayResolution holds the size ("5.5 inches") and
    // displaySize the resolution ("720 x 1280 pixels").
    screenSize: toText(dto.displayResolution),
    screenResolution: toText(dto.displaySize),
    battery: toText(dto.battery),
    primaryCamera: toText(dto.primaryCamera),
    secondaryCamera: toText(dto.secondaryCmera),
    dimensions: toText(dto.dimentions),
    weight: toText(dto.weight),
    options: {
      colors: toOptions(dto.options?.colors),
      storages: toOptions(dto.options?.storages),
    },
  }
}
