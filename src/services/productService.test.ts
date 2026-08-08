const productMocks = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  selectProducts: vi.fn(),
  order: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({ supabase: { from: productMocks.from } }))

import { buildProductUpdate, getProducts, updateProduct, validateProductChanges } from './productService'

describe('validación y actualización de productos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    productMocks.from.mockReturnValue({ update: productMocks.update, select: productMocks.selectProducts })
    productMocks.update.mockReturnValue({ eq: productMocks.eq })
    productMocks.eq.mockReturnValue({ select: productMocks.select })
    productMocks.select.mockReturnValue({ single: productMocks.single })
    productMocks.selectProducts.mockReturnValue({ order: productMocks.order })
    productMocks.single.mockResolvedValue({
      data: {
        id: 'producto-test', codigo: 'TEST', nombre: 'Producto', descripcion: null, precio: 1200,
        stock_docenas: 0, imagen_url: null, activo: true, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z',
      },
      error: null,
    })
  })

  it('lista también productos inactivos sin aplicar filtros', async () => {
    productMocks.order.mockResolvedValue({
      data: [
        { id: 'activo', activo: true },
        { id: 'pausado', activo: false },
      ],
      error: null,
    })

    await expect(getProducts()).resolves.toHaveLength(2)
    expect(productMocks.from).toHaveBeenCalledWith('productos')
    expect(productMocks.selectProducts).toHaveBeenCalledOnce()
  })

  it('rechaza precio menor o igual a cero', () => {
    expect(validateProductChanges({ precio: 0, stock_docenas: 1, activo: true })).toContain('precio')
    expect(validateProductChanges({ precio: -0.01, stock_docenas: 1, activo: true })).toContain('precio')
  })

  it('rechaza stock negativo', () => {
    expect(validateProductChanges({ precio: 10, stock_docenas: -1, activo: true })).toContain('stock')
  })

  it('rechaza stock decimal', () => {
    expect(validateProductChanges({ precio: 10, stock_docenas: 1.5, activo: true })).toContain('entero')
  })

  it('acepta precio positivo decimal y stock cero', () => {
    expect(validateProductChanges({ precio: 10.5, stock_docenas: 0, activo: true })).toBeNull()
  })

  it('no consulta Supabase cuando los valores son inválidos', async () => {
    await expect(updateProduct('producto-test', { precio: 0, stock_docenas: 2, activo: true })).rejects.toThrow('precio')
    await expect(updateProduct('producto-test', { precio: 1, stock_docenas: -2, activo: true })).rejects.toThrow('stock')
    expect(productMocks.from).not.toHaveBeenCalled()
  })

  it('envía exclusivamente precio, stock_docenas, activo y updated_at', async () => {
    await updateProduct('producto-test', { precio: 1200.5, stock_docenas: 0, activo: false })

    expect(productMocks.from).toHaveBeenCalledWith('productos')
    const payload = productMocks.update.mock.calls[0][0]
    expect(Object.keys(payload).sort()).toEqual(['activo', 'precio', 'stock_docenas', 'updated_at'].sort())
    expect(payload).toMatchObject({ precio: 1200.5, stock_docenas: 0, activo: false })
    expect(payload).not.toHaveProperty('nombre')
    expect(payload).not.toHaveProperty('codigo')
  })

  it('el constructor del update mantiene el mismo conjunto permitido', () => {
    expect(Object.keys(buildProductUpdate({ precio: 10, stock_docenas: 2, activo: false })).sort()).toEqual(
      ['activo', 'precio', 'stock_docenas', 'updated_at'].sort(),
    )
  })
})
