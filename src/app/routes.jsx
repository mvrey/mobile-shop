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
    errorElement: <RouteErrorPage />,
    handle: { crumb: () => 'Products' },
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
]
