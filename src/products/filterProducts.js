// Keeps the products whose brand + model contain every word of the query,
// ignoring case and word order ("z6 acer" matches "Acer Liquid Z6").
export function filterProducts(products, query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return products

  return products.filter((product) => {
    const text = `${product.brand} ${product.model}`.toLowerCase()
    return terms.every((term) => text.includes(term))
  })
}
