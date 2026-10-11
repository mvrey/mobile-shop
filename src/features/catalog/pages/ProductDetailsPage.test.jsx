import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { iconiaTalkSProduct as iconiaTalkS, iconiaTalkSSummary } from '../../../test/fixtures'
import { renderApp } from '../../../test/renderApp'
import { addToCart } from '../../cart/api/cartApi'
import { getProduct, getProducts } from '../api/catalogApi'

vi.mock('../api/catalogApi', () => ({ getProducts: vi.fn(), getProduct: vi.fn() }))
vi.mock('../../cart/api/cartApi', () => ({ addToCart: vi.fn() }))

const path = `/product/${iconiaTalkS.id}`

function cartBadge() {
  return screen.getByRole('status', { name: /in cart/i })
}

describe('ProductDetailsPage', () => {
  beforeEach(() => {
    vi.mocked(getProducts).mockReset()
    vi.mocked(getProduct).mockReset().mockResolvedValue(iconiaTalkS)
    vi.mocked(addToCart).mockReset().mockResolvedValue({ count: 1 })
  })

  it('shows the image and every required attribute', async () => {
    renderApp(path)

    expect(screen.getByText(/loading product/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Acer Iconia Talk S' })).toHaveAttribute(
      'src',
      iconiaTalkS.imageUrl,
    )

    const specs = screen.getAllByRole('term').map((term) => term.textContent)
    expect(specs).toEqual(
      expect.arrayContaining([
        'Brand',
        'Model',
        'Price',
        'CPU',
        'RAM',
        'Operating system',
        'Screen resolution',
        'Battery',
        'Main camera',
        'Dimensions',
        'Weight',
      ]),
    )
    expect(screen.getByText('720 x 1280 pixels (~210 ppi pixel density)')).toBeInTheDocument()
    expect(document.title).toBe('Acer Iconia Talk S | Mobile Shop')
  })

  it('shows the product name in the breadcrumbs', async () => {
    renderApp(path)

    const breadcrumbs = screen.getByRole('navigation', { name: /breadcrumb/i })
    expect(await within(breadcrumbs).findByText('Acer Iconia Talk S')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('preselects an option only when it is the only one', async () => {
    renderApp(path)

    const color = await screen.findByRole('group', { name: 'Color' })
    const storage = screen.getByRole('group', { name: 'Storage' })

    expect(within(color).getByRole('radio', { name: 'Black' })).toBeChecked()
    expect(within(storage).getByRole('radio', { name: '16 GB' })).not.toBeChecked()
    expect(within(storage).getByRole('radio', { name: '32 GB' })).not.toBeChecked()
  })

  it('enables "Add to cart" only once every option is chosen', async () => {
    renderApp(path)

    const button = await screen.findByRole('button', { name: /add to cart/i })
    expect(button).toBeDisabled()
    expect(screen.getByText(/choose a storage and a color/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: '32 GB' }))

    expect(button).toBeEnabled()
  })

  it('adds the selection to the cart and updates the header count', async () => {
    renderApp(path)
    expect(cartBadge()).toHaveAccessibleName('0 items in cart')

    await userEvent.click(await screen.findByRole('radio', { name: '32 GB' }))
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(addToCart).toHaveBeenCalledWith({
      id: iconiaTalkS.id,
      colorCode: 1000,
      storageCode: 2001,
    })
    expect(await screen.findByText(/added to your cart/i)).toBeInTheDocument()
    expect(cartBadge()).toHaveAccessibleName('1 item in cart')

    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(await screen.findByRole('status', { name: '2 items in cart' })).toBeInTheDocument()
  })

  it('can add straight away when every option has a single choice', async () => {
    getProduct.mockResolvedValue({
      ...iconiaTalkS,
      options: { colors: [{ code: 1000, name: 'Black' }], storages: [{ code: 2000, name: '16 GB' }] },
    })
    renderApp(path)

    expect(await screen.findByRole('button', { name: /add to cart/i })).toBeEnabled()
  })

  it('reports a failed add and leaves the count unchanged', async () => {
    addToCart.mockRejectedValue(new Error('network down'))
    renderApp(path)

    await userEvent.click(await screen.findByRole('radio', { name: '16 GB' }))
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(await screen.findByText(/couldn't add it to your cart/i)).toBeInTheDocument()
    expect(cartBadge()).toHaveAccessibleName('0 items in cart')
  })

  it('shows an error with a retry when the product cannot be loaded', async () => {
    getProduct.mockReset()
    getProduct.mockRejectedValueOnce(new Error('500')).mockRejectedValueOnce(new Error('500'))
    getProduct.mockResolvedValue(iconiaTalkS)
    renderApp(path)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn't load this product/i)

    await userEvent.click(within(alert).getByRole('button', { name: /try again/i }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Iconia Talk S' })).toBeInTheDocument()
  })

  it('links back to the product list, keeping the search', async () => {
    getProducts.mockResolvedValue([iconiaTalkSSummary])
    const { router } = renderApp('/?q=talk')

    await userEvent.click(await screen.findByRole('link', { name: /iconia talk s/i }))
    await userEvent.click(await screen.findByRole('link', { name: /back to products/i }))

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.location.search).toBe('?q=talk')
  })
})
