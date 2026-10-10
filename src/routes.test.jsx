import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderApp } from './test/renderApp'

// The list page fetches products; this suite only cares about routing.
vi.mock('./services/api', () => ({ getProducts: vi.fn(() => Promise.resolve([])) }))

function breadcrumbs() {
  return within(screen.getByRole('navigation', { name: /breadcrumb/i }))
}

describe('routing and header', () => {
  it('shows the product list at the root path', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: /products/i })).toBeInTheDocument()
    expect(breadcrumbs().getByText('Products')).toHaveAttribute('aria-current', 'page')
  })

  it('shows the details page with a breadcrumb link back to the list', async () => {
    const { router } = renderApp('/product/abc')

    expect(screen.getByRole('heading', { name: /product abc/i })).toBeInTheDocument()
    expect(breadcrumbs().getByText('Product details')).toHaveAttribute('aria-current', 'page')

    await userEvent.click(breadcrumbs().getByRole('link', { name: 'Products' }))
    expect(router.state.location.pathname).toBe('/')
  })

  it('navigates home from the app title', async () => {
    const { router } = renderApp('/product/abc')

    await userEvent.click(screen.getByRole('link', { name: /mobile shop/i }))

    expect(router.state.location.pathname).toBe('/')
  })

  it('shows a not-found page for unknown paths', () => {
    renderApp('/does/not/exist')

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })

  it('shows the cart count in the header', () => {
    localStorage.setItem('mobile-shop:cart-count', '3')
    renderApp('/')

    expect(screen.getByRole('status', { name: '3 items in cart' })).toBeInTheDocument()
  })
})
