import { render, screen } from '@testing-library/react'
import type { Product } from '../types/database'

const productMocks = vi.hoisted(() => ({ getProducts: vi.fn() }))

vi.mock('../services/productService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/productService')>()
  return { ...actual, getProducts: productMocks.getProducts }
})

import { ProductsPage } from './ProductsPage'

const product = (id: string, activo: boolean, stock_docenas: number): Product => ({
  id,
  codigo: `COD-${id}`,
  nombre: `Producto ${id}`,
  descripcion: null,
  precio: 1000,
  stock_docenas,
  imagen_url: null,
  activo,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
})

describe('ProductsPage', () => {
  it('muestra productos disponibles, sin stock y pausados', async () => {
    productMocks.getProducts.mockResolvedValue([
      product('disponible', true, 2),
      product('sin-stock', true, 0),
      product('pausado', false, 5),
    ])

    render(<ProductsPage />)

    expect(await screen.findByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
    expect(screen.getByText('Pausado')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(3)
  })
})
