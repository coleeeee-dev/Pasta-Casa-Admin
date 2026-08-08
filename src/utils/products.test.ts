import { getProductAvailability } from './products'

describe('estado visual del producto', () => {
  it('muestra Disponible cuando está activo y tiene stock', () => {
    expect(getProductAvailability({ activo: true, stock_docenas: 3 })).toEqual({ key: 'available', label: 'Disponible' })
  })

  it('muestra Sin stock cuando está activo y el stock es cero', () => {
    expect(getProductAvailability({ activo: true, stock_docenas: 0 })).toEqual({ key: 'out-of-stock', label: 'Sin stock' })
  })

  it('muestra Pausado cuando está inactivo', () => {
    expect(getProductAvailability({ activo: false, stock_docenas: 5 })).toEqual({ key: 'paused', label: 'Pausado' })
  })
})
