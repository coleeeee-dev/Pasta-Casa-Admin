import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Product } from '../types/database'

const productMocks = vi.hoisted(() => ({ updateProduct: vi.fn() }))

vi.mock('../services/productService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/productService')>()
  return { ...actual, updateProduct: productMocks.updateProduct }
})

import { ProductEditorModal } from './ProductEditorModal'

const product: Product = {
  id: 'producto-test',
  codigo: 'PROD-TEST',
  nombre: 'Producto de prueba',
  descripcion: null,
  precio: 1000,
  stock_docenas: 4,
  imagen_url: null,
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('ProductEditorModal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('conserva el formulario y no simula éxito si Supabase falla', async () => {
    productMocks.updateProduct.mockRejectedValue(new Error('Supabase rechazó la actualización del producto'))
    const onSaved = vi.fn()
    render(<ProductEditorModal product={product} onClose={vi.fn()} onSaved={onSaved} />)

    const priceInput = screen.getByRole('spinbutton', { name: /Precio por docena/ })
    fireEvent.change(priceInput, { target: { value: '1250.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('No se guardaron los cambios.')).toBeInTheDocument()
    expect(screen.getByText('Supabase rechazó la actualización del producto')).toBeInTheDocument()
    expect(priceInput).toHaveValue(1250.5)
    expect(onSaved).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('requiere confirmación antes de desactivar un producto', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ProductEditorModal product={product} onClose={vi.fn()} onSaved={vi.fn()} />)

    const activeSwitch = screen.getByRole('checkbox', { name: /Disponible para la venta/ })
    fireEvent.click(activeSwitch)

    expect(confirmSpy).toHaveBeenCalledWith('Este producto dejará de aparecer disponible para los clientes.\n¿Deseás continuar?')
    expect(activeSwitch).toBeChecked()
    confirmSpy.mockRestore()
  })

  it('confirma antes de descartar cambios sin guardar', () => {
    const onClose = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<ProductEditorModal product={product} onClose={onClose} onSaved={vi.fn()} />)

    fireEvent.change(screen.getByRole('spinbutton', { name: /Stock disponible/ }), { target: { value: '8' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(confirmSpy).toHaveBeenCalledWith('Tenés cambios sin guardar. ¿Querés descartarlos?')
    expect(onClose).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('bloquea el doble envío mientras está guardando', async () => {
    let resolveUpdate: ((value: Product) => void) | undefined
    productMocks.updateProduct.mockImplementation(() => new Promise<Product>((resolve) => { resolveUpdate = resolve }))
    const onSaved = vi.fn()
    render(<ProductEditorModal product={product} onClose={vi.fn()} onSaved={onSaved} />)

    const saveButton = screen.getByRole('button', { name: 'Guardar cambios' })
    fireEvent.click(saveButton)
    fireEvent.click(saveButton)

    expect(productMocks.updateProduct).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled()
    resolveUpdate?.({ ...product, updated_at: '2026-01-02T00:00:00Z' })
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
  })
})
