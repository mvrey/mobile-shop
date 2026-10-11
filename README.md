# Mobile Shop

A single-page application for browsing and buying mobile devices, built as the ITX
front-end technical test with React and plain JavaScript.

- **Product list:** the full catalogue in a responsive grid (1 to 4 per row depending on
  screen width), with a search box that filters by brand and model as you type.
- **Product details:** image on one side; specifications and purchase actions (storage and
  color selectors, "Add to cart") on the other. Two columns on every screen size; on phones
  the image column is narrower.
- **Header:** the app title links home, breadcrumbs show where you are (including the
  product's name), and the cart counter is visible on every view and survives reloads.
- **Client-side cache:** API responses are kept in the browser for 1 hour, then fetched again.

## Getting started

Requires **Node.js 22.22+ or 24.15+** (developed with Node 24). An `.nvmrc` is included.

```bash
npm install
npm start          # dev server at http://localhost:5173
```

| Script          | What it does                            |
| --------------- | --------------------------------------- |
| `npm start`     | Development mode (Vite dev server, HMR) |
| `npm run build` | Production build into `dist/`           |
| `npm test`      | Runs the test suite once (Vitest)       |
| `npm run lint`  | Lints the code (ESLint)                 |

Extras:

| Script                  | What it does                                |
| ----------------------- | ------------------------------------------- |
| `npm run preview`       | Serves the production build locally         |
| `npm run test:watch`    | Runs the tests in watch mode                |
| `npm run test:coverage` | Runs the tests with a coverage report       |
| `npm run format`        | Formats the code (Prettier)                 |
| `npm run format:check`  | Checks formatting without changing any file |

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint, format check, tests and
build on every push and pull request.

> **First load can be slow.** The API is hosted on a free tier that sleeps when idle, so the
> first request may take up to a minute. After 3 seconds the app tells the user the server
> is waking up. Later visits are served from the cache.

### Deploying the build

`dist/` is a static site. Because routing happens in the browser, the server must answer
every unknown path (e.g. `/product/abc`) with `index.html`, the usual "SPA fallback". Vite's
dev and preview servers already do this; on Netlify, Vercel, Nginx, etc. it is a one-line
rewrite rule.

## Tech stack

- [React 19](https://react.dev/) with plain JavaScript (ES2020+, no TypeScript)
- [Vite](https://vite.dev/) for the dev server and production build
- [React Router](https://reactrouter.com/) for client-side routing (SPA, no SSR)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + jsdom for tests
- [ESLint](https://eslint.org/) with the React Hooks and accessibility (jsx-a11y) rules, and
  [Prettier](https://prettier.io/) for formatting
- CSS Modules for component styles (no UI library)
- JSDoc types for the domain model and component props, for editor hints without TypeScript

No other runtime dependencies: fetching, caching and state use the browser and React itself.

## Project structure

Code is grouped by feature. Dependencies point one way: `app` → `features` → `shared`.

```
src/
├── main.jsx                 Entry point: router + cart provider
├── app/                     App shell: route table, layout, header, breadcrumbs,
│                            not-found and unexpected-error pages
├── features/
│   ├── catalog/             Browsing products
│   │   ├── api/             getProducts / getProduct (cached, mapped to the domain model)
│   │   ├── domain/          Product model + API mappers, search filter, price, spec rows
│   │   ├── hooks/           useProducts, useProduct
│   │   ├── components/      ProductCard, SearchBar, ProductCrumb
│   │   └── pages/           Product list, product details
│   └── cart/                The cart: count, "add to cart" operation, badge, actions form
│       └── api/             POST /api/cart
├── shared/
│   ├── api/                 fetch wrapper (httpClient) + cache-aware fetcher with dedupe
│   ├── cache/               Key/value cache with 1-hour expiry, persisted in localStorage
│   ├── storage/             Namespaced localStorage wrapper that never throws
│   ├── hooks/               useRequest: { data, error, loading, retry }
│   └── ui/                  Loading/error states, option selector
└── test/                    Test setup, render helper, fixtures
```

## Design decisions

- **The app has its own product model.** The API's quirks (misspelled fields, swapped
  display fields, string prices, string-or-array attributes) are fixed once, in the mappers in
  `features/catalog/domain/product.js`. Components only see clean `Product` objects.
- **The cart owns its operation.** `CartProvider` exposes `addToCart(selection)`, which calls
  the API and updates the count; the actions form only collects the selection and reports the
  outcome. The API call is injected, so tests can replace it.
- **Features don't import each other.** The details page (catalog) renders the purchase form
  (cart) through a `renderActions` slot that `app/routes.jsx` fills in, so the composition
  happens in the app shell.
- **Caching lives in the API layer**, not in components. `getProducts()` and `getProduct(id)`
  return cached data when it is fresh and only hit the network otherwise. Concurrent requests
  for the same data share one network call (React StrictMode runs effects twice in
  development, and the breadcrumb and page both ask for the same product).
- **Search state is in the URL** (`/?q=acer`). Going to a product and back, or reloading,
  keeps the search. Every word typed must appear in brand + model, in any order and ignoring
  case, so "z6 acer" finds "Acer Liquid Z6".
- **Selectors are native radio buttons** styled as pills, so keyboard navigation and screen
  readers work without extra code. A selector with a single option is preselected, as the
  spec requires; "Add to cart" stays disabled until both are chosen.
- **Breadcrumbs are data-driven:** each route declares a `crumb` in its `handle`, and the
  product route renders the product's name once it has loaded.
- **Loading, empty and error states everywhere**, with a "Try again" button on errors that a
  retry can fix (not on "this product doesn't exist"). Failed
  responses are never cached, so retrying really refetches.
- **Accessibility:** semantic landmarks and headings, labelled search and cart counter,
  visible focus styles, alt text on images, and page titles per view.

## Testing

```bash
npm test
```

105 tests (over 99% line coverage, `npm run test:coverage`): unit tests for the HTTP client,
cache, storage, domain mappers and helpers, hooks and shared components, plus full-page tests.
Page tests render the whole app (router, header, providers) at a given URL and only replace
the API calls, so they exercise real routing, hooks and components the way a user would:
typing in the search box, choosing options, clicking "Add to cart" and checking the header.
Fixtures are trimmed copies of real API responses.

## API

Base URL: `https://itx-frontend-test.onrender.com/` (override with `VITE_API_BASE_URL`).

| Method | Path               | Purpose                                      |
| ------ | ------------------ | -------------------------------------------- |
| GET    | `/api/product`     | Product list                                 |
| GET    | `/api/product/:id` | Product details                              |
| POST   | `/api/cart`        | Add `{ id, colorCode, storageCode }` to cart |

### Caching

`GET` responses are stored in `localStorage` with a 1-hour expiry
(`src/shared/cache/storageCache.js`), so they survive page reloads. Once an entry is older
than an hour it is discarded and fetched again; expired entries are also swept on startup.
Entries are keyed by full URL, so switching `VITE_API_BASE_URL` never serves another API's
data. If the browser blocks storage (private mode, quota exceeded), the app keeps working
without the cache. `POST /api/cart` is never cached.

Requests give up after 90 seconds (longer than the API's wake-up time) and show the error
state with a retry button.

### Notes on the API

- **Cart count:** `POST /api/cart` is a mock that always answers `{ "count": 1 }`, whatever
  was in the cart before. The app treats that number as "items just added" and keeps the
  running total on the client (persisted in `localStorage`), so the header counter goes
  1, 2, 3… instead of being stuck at 1.
- **Swapped display fields:** in the product details, `displayResolution` holds the screen
  size ("5.5 inches") and `displaySize` holds the resolution ("720 x 1280 pixels"). The UI
  labels each by what it actually contains.
- **Mixed field types:** some attributes (cameras, OS) come as a string for some products and
  as an array for others. Both are normalised to readable text, and empty values are hidden.
- **Prices:** sent as strings, and empty for some products ("Price not available"). They are
  shown in euros, formatted for an English-language UI: "€170", "€99.50".
- **Unknown product IDs:** the API answers `500` rather than `404`. When a product fails to
  load, the app checks the (usually cached) product list, and a fresh copy if the cached one
  could be outdated: if the id isn't there, the page says the product doesn't exist;
  otherwise it shows a generic error with a retry button.
