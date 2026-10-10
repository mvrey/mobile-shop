import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { CartProvider } from '../cart/CartProvider'
import { routes } from '../routes'

// Renders the whole app at the given URL, using an in-memory router
// (no real browser history needed).
export function renderApp(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>,
  )
  return { router }
}
