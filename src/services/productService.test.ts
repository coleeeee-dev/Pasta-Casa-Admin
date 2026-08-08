const productMocks = vi.hoisted(() => ({ from: vi.fn() }))

vi.mock('../lib/supabase', () => ({ supabase: { from: productMocks.from } }))

import { buildProductUpdate, updateProduct, validateProductChanges } from './productService'

describe('validación de productos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rechaza stock negativo o no entero', () => {
    expect(validateProductChanges({ precio: 10, stock_docenas: -1, activo: true })).toContain('stock')
    expect(validateProductChanges({ precio: 10, stock_docenas: 1.5, activo: true })).toContain('entero')
  })

  it('rechaza precios negativos', () => {
    expect(validateProductChanges({ precio: -0.01, stock_docenas: 1, activo: true })).toContain('precio')
  })

  it('no consulta Supabase cuando hay valores negativos', async () => {
    await expect(updateProduct('producto-test', { precio: -1, stock_docenas: 2, activo: true })).rejects.toThrow('precio')
    await expect(updateProduct('producto-test', { precio: 1, stock_docenas: -2, activo: true })).rejects.toThrow('stock')
    expect(productMocks.from).not.toHaveBeenCalled()
  })

  it('crea un payload limitado a los campos editables y updated_at', () => {
    expect(Object.keys(buildProductUpdate({ precio: 10, stock_docenas: 2, activo: false })).sort()).toEqual(
      ['activo', 'precio', 'stock_docenas', 'updated_at'].sort(),
    )
  })
})
