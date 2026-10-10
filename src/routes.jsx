import Layout from './components/Layout'
import ProductListPage from './pages/ProductListPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import NotFoundPage from './pages/NotFoundPage'

// Each route's `handle.crumb` is the label the breadcrumbs show for it.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    handle: { crumb: () => 'Products' },
    children: [
      { index: true, element: <ProductListPage /> },
      {
        path: 'product/:id',
        element: <ProductDetailsPage />,
        handle: { crumb: () => 'Product details' },
      },
      { path: '*', element: <NotFoundPage />, handle: { crumb: () => 'Not found' } },
    ],
  },
]
