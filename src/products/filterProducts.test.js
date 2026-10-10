import { describe, expect, it } from 'vitest'
import { filterProducts } from './filterProducts'

const products = [
  { id: '1', brand: 'Acer', model: 'Liquid Z6' },
  { id: '2', brand: 'Acer', model: 'Iconia Talk S' },
  { id: '3', brand: 'alcatel', model: 'Idol 5' },
]

const ids = (list) => list.map((product) => product.id)

describe('filterProducts', () => {
  it('returns every product for an empty or blank query', () => {
    expect(filterProducts(products, '')).toBe(products)
    expect(filterProducts(products, '   ')).toBe(products)
  })

  it('matches the brand, ignoring case', () => {
    expect(ids(filterProducts(products, 'ACER'))).toEqual(['1', '2'])
    expect(ids(filterProducts(products, 'Alcatel'))).toEqual(['3'])
  })

  it('matches the model', () => {
    expect(ids(filterProducts(products, 'iconia'))).toEqual(['2'])
  })

  it('requires every word to match, in any order and across brand and model', () => {
    expect(ids(filterProducts(products, 'z6 acer'))).toEqual(['1'])
    expect(ids(filterProducts(products, 'acer idol'))).toEqual([])
  })

  it('matches partial words', () => {
    expect(ids(filterProducts(products, 'liq'))).toEqual(['1'])
  })
})
