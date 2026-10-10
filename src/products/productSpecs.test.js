import { describe, expect, it } from 'vitest'
import { productSpecs } from './productSpecs'

// Shape taken from the real API (GET /api/product/:id), trimmed.
const product = {
  brand: 'Acer',
  model: 'Iconia Talk S',
  price: '170',
  cpu: 'Quad-core 1.3 GHz Cortex-A53',
  ram: '2 GB RAM',
  os: 'Android 6.0 (Marshmallow)',
  displayResolution: '7.0 inches (~69.8% screen-to-body ratio)',
  displaySize: '720 x 1280 pixels (~210 ppi pixel density)',
  battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
  primaryCamera: ['13 MP', 'autofocus', ''],
  secondaryCmera: '2 MP',
  dimentions: '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)',
  weight: '260',
}

const asObject = (rows) => Object.fromEntries(rows.map(({ label, value }) => [label, value]))

describe('productSpecs', () => {
  it('lists every attribute the spec requires, with readable values', () => {
    expect(asObject(productSpecs(product))).toEqual({
      Brand: 'Acer',
      Model: 'Iconia Talk S',
      Price: expect.stringMatching(/^170\s€$/),
      CPU: 'Quad-core 1.3 GHz Cortex-A53',
      RAM: '2 GB RAM',
      'Operating system': 'Android 6.0 (Marshmallow)',
      'Screen size': '7.0 inches (~69.8% screen-to-body ratio)',
      'Screen resolution': '720 x 1280 pixels (~210 ppi pixel density)',
      Battery: 'Non-removable Li-Ion 3400 mAh battery (12.92 Wh)',
      'Main camera': '13 MP, autofocus',
      'Front camera': '2 MP',
      Dimensions: '191.7 x 101 x 9.4 mm (7.55 x 3.98 x 0.37 in)',
      Weight: '260 g',
    })
  })

  it('says when the price is missing', () => {
    expect(asObject(productSpecs({ ...product, price: '' })).Price).toBe('Not available')
  })

  it('skips attributes the API left empty', () => {
    const rows = asObject(productSpecs({ ...product, secondaryCmera: '', weight: '', os: [] }))

    expect(rows).not.toHaveProperty('Front camera')
    expect(rows).not.toHaveProperty('Weight')
    expect(rows).not.toHaveProperty('Operating system')
  })
})
