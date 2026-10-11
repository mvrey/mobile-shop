import { describe, expect, it } from 'vitest'
import { iconiaTalkS } from '../../../test/fixtures'
import { toProduct, toProductSummaries, toProductSummary } from './product'

describe('product mappers', () => {
  it('maps a list item to a summary, with the price as a number', () => {
    expect(toProductSummary(iconiaTalkS)).toEqual({
      id: 'ZmGrkLRPXOTpxsU4jjAcv',
      brand: 'Acer',
      model: 'Iconia Talk S',
      price: 170,
      imageUrl: iconiaTalkS.imgUrl,
    })
  })

  it('maps a missing or invalid price to null', () => {
    expect(toProductSummary({ ...iconiaTalkS, price: '' }).price).toBeNull()
    expect(toProductSummary({ ...iconiaTalkS, price: 'abc' }).price).toBeNull()
    expect(toProductSummary({ ...iconiaTalkS, price: undefined }).price).toBeNull()
  })

  it('rejects a product list that is not a list', () => {
    expect(() => toProductSummaries({ error: 'oops' })).toThrow(TypeError)
  })

  it('fixes the API quirks in the details', () => {
    const product = toProduct(iconiaTalkS)

    // Swapped display fields, misspelled names, arrays joined into text.
    expect(product.screenSize).toBe('7.0 inches (~69.8% screen-to-body ratio)')
    expect(product.screenResolution).toBe('720 x 1280 pixels (~210 ppi pixel density)')
    expect(product.secondaryCamera).toBe('2 MP, 720p')
    expect(product.dimensions).toBe('191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)')
    expect(product.primaryCamera).toBe('13 MP, autofocus')
    expect(product.options.storages).toHaveLength(2)
  })

  it('turns missing values into empty text and missing options into empty lists', () => {
    const product = toProduct({ id: 'x', primaryCamera: ['', ''], os: null })

    expect(product.primaryCamera).toBe('')
    expect(product.os).toBe('')
    expect(product.weight).toBe('')
    expect(product.options).toEqual({ colors: [], storages: [] })
  })
})
