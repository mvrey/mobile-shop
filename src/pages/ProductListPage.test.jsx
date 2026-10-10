import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProducts } from '../services/api'
import { renderApp } from '../test/renderApp'

vi.mock('../services/api', () => ({ getProducts: vi.fn() }))

const products = [
  { id: 'z6', brand: 'Acer', model: 'Liquid Z6', price: '120', imgUrl: '/z6.jpg' },
  { id: 'talk', brand: 'Acer', model: 'Iconia Talk S', price: '170', imgUrl: '/talk.jpg' },
  { id: 'idol', brand: 'alcatel', model: 'Idol 5', price: '', imgUrl: '/idol.jpg' },
]

function productNames() {
  return screen.queryAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
}

describe('ProductListPage', () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockReset()
  })

  it('shows a loading state, then every product', async () => {
    getProducts.mockResolvedValue(products)
    renderApp('/')

    expect(screen.getByText(/loading products/i)).toBeInTheDocument()
    expect(await screen.findByText('3 of 3 products')).toBeInTheDocument()
    expect(productNames()).toEqual(['Liquid Z6', 'Iconia Talk S', 'Idol 5'])
  })

  it('shows image, brand, model and price on each card, and links to its details', async () => {
    getProducts.mockResolvedValue(products)
    renderApp('/')

    const card = await screen.findByRole('link', { name: /liquid z6/i })
    expect(within(card).getByRole('img', { name: 'Acer Liquid Z6' })).toHaveAttribute('src', '/z6.jpg')
    expect(within(card).getByText('Acer')).toBeInTheDocument()
    expect(within(card).getByText(/^120\s€$/)).toBeInTheDocument()
    expect(card).toHaveAttribute('href', '/product/z6')
  })

  it('labels products that have no price', async () => {
    getProducts.mockResolvedValue(products)
    renderApp('/')

    const card = await screen.findByRole('link', { name: /idol 5/i })
    expect(within(card).getByText('Price not available')).toBeInTheDocument()
  })

  it('filters by brand and model as the user types', async () => {
    getProducts.mockResolvedValue(products)
    const { router } = renderApp('/')
    const search = await screen.findByRole('searchbox', { name: /search products/i })

    await userEvent.type(search, 'acer')
    expect(productNames()).toEqual(['Liquid Z6', 'Iconia Talk S'])

    await userEvent.type(search, ' z6')
    expect(productNames()).toEqual(['Liquid Z6'])
    expect(screen.getByText('1 of 3 products')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=acer+z6')
  })

  it('restores the search from the URL', async () => {
    getProducts.mockResolvedValue(products)
    renderApp('/?q=idol')

    expect(await screen.findByRole('searchbox')).toHaveValue('idol')
    expect(productNames()).toEqual(['Idol 5'])
  })

  it('says so when nothing matches', async () => {
    getProducts.mockResolvedValue(products)
    renderApp('/?q=nokia')

    expect(await screen.findByText('No products match “nokia”.')).toBeInTheDocument()
  })

  it('shows an error with a retry button that loads again', async () => {
    getProducts.mockRejectedValueOnce(new Error('network down'))
    getProducts.mockResolvedValueOnce(products)
    renderApp('/')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't load the products/i)

    await userEvent.click(within(alert).getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('3 of 3 products')).toBeInTheDocument()
    expect(getProducts).toHaveBeenCalledTimes(2)
  })
})
