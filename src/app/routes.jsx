import Layout from './Layout'
import ProductCrumb from '../features/catalog/components/ProductCrumb'
import ProductListPage from '../features/catalog/pages/ProductListPage'
import ProductDetailsPage from '../features/catalog/pages/ProductDetailsPage'
import NotFoundPage from './NotFoundPage'
import RouteErrorPage from './RouteErrorPage'

// Each route's `handle.crumb` is the label the breadcrumbs show for it.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    // Last resort, only if the layout itself fails: there is no header to keep.
    errorElement: (
      <main>
        <RouteErrorPage />
      </main>
    ),
    handle: { crumb: () => 'Products' },
    children: [
      {
        // A page that fails to render is replaced inside the layout, so the header
        // (home link, breadcrumbs, cart count) stays on screen.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <ProductListPage /> },
          {
            path: 'product/:id',
            element: <ProductDetailsPage />,
            handle: { crumb: (match) => <ProductCrumb id={match.params.id} /> },
          },
          { path: '*', element: <NotFoundPage />, handle: { crumb: () => 'Not found' } },
        ],
      },
    ],
  },
]
