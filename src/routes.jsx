import Layout from './components/Layout'
import ProductCrumb from './components/ProductCrumb'
import ProductListPage from './pages/ProductListPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import RouteErrorPage from './pages/RouteErrorPage'

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
