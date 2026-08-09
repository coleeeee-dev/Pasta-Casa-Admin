import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Order } from '../types/database'

const orderMocks = vi.hoisted(() => ({
  getOrderDetails: vi.fn(),
  advanceOrderStatus: vi.fn(),
  cancelOrder: vi.fn(),
  completeOrder: vi.fn(),
}))
const productMocks = vi.hoisted(() => ({ getProducts: vi.fn() }))

vi.mock('../services/orderService', () => orderMocks)
vi.mock('../services/productService', () => productMocks)

import { OrderDrawer } from './OrderDrawer'

const baseOrder: Order = {
  id: 'pedido-test',
  codigo: 'PED-TEST',
  nombre: 'Cliente',
  apellido: 'Prueba',
  telefono: '+54 9 11 2345-6789',
  metodo_pago: 'contraentrega',
  total: 1000,
  estado: 'pendiente_coordinacion',
  stock_reservado: true,
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
}

function renderDrawer(order: Order = baseOrder) {
  const onUpdated = vi.fn()
  const onRefreshOrders = vi.fn().mockResolvedValue(undefined)
  const view = render(
    <OrderDrawer order={order} onClose={vi.fn()} onUpdated={onUpdated} onRefreshOrders={onRefreshOrders} />,
  )
  return { ...view, onUpdated, onRefreshOrders }
}

describe('OrderDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orderMocks.getOrderDetails.mockResolvedValue([])
    productMocks.getProducts.mockResolvedValue([])
  })

  afterEach(() => vi.restoreAllMocks())

  it('muestra teléfono, WhatsApp y el estado de la reserva', async () => {
    renderDrawer()

    expect(screen.getByText('+54 9 11 2345-6789')).toBeInTheDocument()
    expect(screen.getByText('Stock reservado')).toBeInTheDocument()
    expect(screen.queryByText('DNI')).not.toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Contactar por WhatsApp' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link.getAttribute('href')).toContain('5491123456789')
    await screen.findByText('Este pedido no tiene productos registrados.')
  })

  it('tolera un pedido antiguo sin teléfono y deshabilita WhatsApp', async () => {
    renderDrawer({ ...baseOrder, telefono: null })

    expect(screen.getByText('Sin teléfono registrado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contactar por WhatsApp' })).toBeDisabled()
    await screen.findByText('Este pedido no tiene productos registrados.')
  })

  it('una cancelación exitosa refresca pedidos y productos', async () => {
    const cancelledOrder: Order = { ...baseOrder, estado: 'cancelado', stock_reservado: false }
    orderMocks.cancelOrder.mockResolvedValue(cancelledOrder)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { onUpdated, onRefreshOrders } = renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar pedido' }))

    expect(await screen.findByText('Pedido cancelado y stock liberado correctamente')).toBeInTheDocument()
    expect(orderMocks.cancelOrder).toHaveBeenCalledWith(baseOrder.id)
    expect(orderMocks.advanceOrderStatus).not.toHaveBeenCalled()
    expect(onUpdated).toHaveBeenCalledWith(cancelledOrder)
    expect(onRefreshOrders).toHaveBeenCalledOnce()
    expect(productMocks.getProducts).toHaveBeenCalledOnce()
    confirmSpy.mockRestore()
  })

  it('completar refresca pedidos y productos sin usar update directo', async () => {
    const confirmedOrder: Order = { ...baseOrder, estado: 'pedido_confirmado' }
    const completedOrder: Order = { ...confirmedOrder, estado: 'completado', stock_reservado: false }
    orderMocks.completeOrder.mockResolvedValue(completedOrder)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { onUpdated, onRefreshOrders } = renderDrawer(confirmedOrder)

    fireEvent.click(screen.getByRole('button', { name: 'Completar pedido' }))

    expect(await screen.findByText('Pedido completado correctamente')).toBeInTheDocument()
    expect(orderMocks.completeOrder).toHaveBeenCalledWith(baseOrder.id)
    expect(orderMocks.advanceOrderStatus).not.toHaveBeenCalled()
    expect(onUpdated).toHaveBeenCalledWith(completedOrder)
    expect(onRefreshOrders).toHaveBeenCalledOnce()
    expect(productMocks.getProducts).toHaveBeenCalledOnce()
    confirmSpy.mockRestore()
  })

  it('un error RPC conserva el estado anterior y no simula éxito', async () => {
    orderMocks.advanceOrderStatus.mockRejectedValue(new Error('Supabase rechazó la transición de estado'))
    const { onUpdated, onRefreshOrders } = renderDrawer()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar coordinación' }))

    expect(await screen.findByText('Supabase rechazó la transición de estado')).toBeInTheDocument()
    expect(screen.queryByText('El estado del pedido se actualizó correctamente.')).not.toBeInTheDocument()
    expect(screen.getByText('Pendiente de coordinación')).toBeInTheDocument()
    expect(onUpdated).not.toHaveBeenCalled()
    expect(onRefreshOrders).toHaveBeenCalledOnce()
    expect(productMocks.getProducts).not.toHaveBeenCalled()
  })

  it('los estados intermedios utilizan avanzar_estado_pedido_admin', async () => {
    const transferOrder: Order = { ...baseOrder, metodo_pago: 'transferencia', estado: 'pendiente_pago' }
    const updatedOrder: Order = { ...transferOrder, estado: 'esperando_validacion' }
    orderMocks.advanceOrderStatus.mockResolvedValue(updatedOrder)
    const { onUpdated, onRefreshOrders } = renderDrawer(transferOrder)

    fireEvent.click(screen.getByRole('button', { name: 'Comprobante recibido' }))
    await waitFor(() => expect(orderMocks.advanceOrderStatus).toHaveBeenCalledWith(transferOrder.id, 'esperando_validacion'))
    expect(onUpdated).toHaveBeenCalledWith(updatedOrder)
    expect(orderMocks.cancelOrder).not.toHaveBeenCalled()
    expect(orderMocks.completeOrder).not.toHaveBeenCalled()
    expect(onRefreshOrders).not.toHaveBeenCalled()
    expect(productMocks.getProducts).not.toHaveBeenCalled()
  })

  it('pedidos cancelados o completados no ofrecen acciones terminales', async () => {
    const cancelledView = renderDrawer({ ...baseOrder, estado: 'cancelado', stock_reservado: false })
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Completar pedido' })).not.toBeInTheDocument()
    await screen.findByText('Este pedido no tiene productos registrados.')
    cancelledView.unmount()

    renderDrawer({ ...baseOrder, estado: 'completado', stock_reservado: false })
    expect(screen.queryByRole('button', { name: 'Cancelar pedido' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Completar pedido' })).not.toBeInTheDocument()
    await screen.findByText('Este pedido no tiene productos registrados.')
  })
})
