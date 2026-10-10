# Mobile Shop

A small single-page application for browsing and buying mobile devices, built as the
ITX front-end technical test.

> 🚧 Work in progress. This README grows with each milestone.

## Scope

- **PLP (Product List Page):** the full product catalogue in a responsive grid (up to 4 items
  per row) with a search box that filters by brand and model as you type.
- **PDP (Product Details Page):** two columns, with the product image on one side and the
  specs plus purchase actions (storage and color selectors, "Add to cart") on the other.
- **Header:** the app title links home, breadcrumbs show where you are, and a cart counter
  stays visible on every view.
- **Client-side cache:** API responses are cached in the browser for 1 hour, then fetched again.

## Tech stack

- [React](https://react.dev/) with plain JavaScript (ES6+, no TypeScript)
- [Vite](https://vite.dev/) for the dev server and production build
- [React Router](https://reactrouter.com/) for client-side routing (SPA, no SSR)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests
- [ESLint](https://eslint.org/) for linting

## API

Base URL: `https://itx-frontend-test.onrender.com/`

| Method | Path               | Purpose                                      |
| ------ | ------------------ | -------------------------------------------- |
| GET    | `/api/product`     | Product list                                 |
| GET    | `/api/product/:id` | Product details                              |
| POST   | `/api/cart`        | Add `{ id, colorCode, storageCode }` to cart |

The base URL can be overridden with the `VITE_API_BASE_URL` environment variable.

### Caching

`GET` responses are stored in `localStorage` with a 1-hour expiry (`src/services/cache.js`),
so they survive page reloads. Once an entry is older than an hour it is discarded and fetched
again. If the browser blocks storage (private mode, quota exceeded), the app keeps working
without the cache. `POST /api/cart` is never cached.

## Getting started

Requires Node.js 20+ (developed with Node 24).

```bash
npm install
npm start          # dev server at http://localhost:5173
```

| Script          | What it does                               |
| --------------- | ------------------------------------------ |
| `npm start`     | Development mode (Vite dev server, HMR)    |
| `npm run build` | Production build into `dist/`              |
| `npm test`      | Runs the test suite once (Vitest)          |
| `npm run lint`  | Lints the code (ESLint)                    |

Extras: `npm run preview` serves the production build locally, and `npm run test:watch`
runs the tests in watch mode.
