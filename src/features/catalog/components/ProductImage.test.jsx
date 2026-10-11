import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProductImage from './ProductImage'
import placeholder from './product-placeholder.svg'

const product = { id: 'a', brand: 'Acer', model: 'Liquid Z6', price: 120, imageUrl: '/z6.jpg' }

describe('ProductImage', () => {
  it('shows the product image, named after the product', () => {
    render(<ProductImage product={product} />)

    expect(screen.getByRole('img', { name: 'Acer Liquid Z6' })).toHaveAttribute('src', '/z6.jpg')
  })

  it('falls back to a placeholder when the image fails to load', () => {
    render(<ProductImage product={product} />)
    const image = screen.getByRole('img', { name: 'Acer Liquid Z6' })

    fireEvent.error(image)

    expect(image).toHaveAttribute('src', placeholder)
  })

  it('tries again for a different product', () => {
    const { rerender } = render(<ProductImage product={product} />)
    fireEvent.error(screen.getByRole('img'))

    rerender(<ProductImage product={{ ...product, imageUrl: '/other.jpg' }} />)

    expect(screen.getByRole('img')).toHaveAttribute('src', '/other.jpg')
  })
})
