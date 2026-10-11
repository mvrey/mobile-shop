import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { CartProvider } from './features/cart/CartProvider'
import { routes } from './app/routes'
import { createStorageCache } from './shared/cache/storageCache'
import './index.css'

// Sweep cache entries that expired since the last visit.
createStorageCache().prune()

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </StrictMode>,
)
