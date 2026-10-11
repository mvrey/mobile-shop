import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import Breadcrumbs from './Breadcrumbs'

// A small route tree, independent of the app's: crumbs come from `handle.crumb`.
function renderAt(path) {
  const routes = [
    {
      path: '/',
      element: (
        <>
          <Breadcrumbs />
          <Outlet />
        </>
      ),
      handle: { crumb: () => 'Home' },
      children: [
        { index: true },
        {
          path: 'section',
          handle: { crumb: () => 'Section' },
          element: <Outlet />,
          children: [
            { index: true },
            { path: ':itemId', handle: { crumb: (match) => `Item ${match.params.itemId}` } },
          ],
        },
        { path: 'no-crumb' },
      ],
    },
  ]
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />)
  return within(screen.getByRole('navigation', { name: 'Breadcrumb' }))
}

describe('Breadcrumbs', () => {
  it('links every level except the current page', () => {
    const crumbs = renderAt('/section/42')

    expect(crumbs.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(crumbs.getByRole('link', { name: 'Section' })).toHaveAttribute('href', '/section')
    expect(crumbs.getByText('Item 42')).toHaveAttribute('aria-current', 'page')
    expect(crumbs.queryByRole('link', { name: 'Item 42' })).not.toBeInTheDocument()
  })

  it('shows a single, unlinked crumb at the top level', () => {
    const crumbs = renderAt('/')

    expect(crumbs.getAllByRole('listitem')).toHaveLength(1)
    expect(crumbs.getByText('Home')).toHaveAttribute('aria-current', 'page')
  })

  it('skips routes without a crumb', () => {
    const crumbs = renderAt('/no-crumb')

    expect(crumbs.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Home'])
  })
})
