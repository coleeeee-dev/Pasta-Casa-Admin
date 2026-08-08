import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { Order } from '../types/database'

const orderMocks = vi.hoisted(() => ({
  getOrderDetails: vi.fn(),
  updateOrderStatus: vi.fn(),
}))

vi.mock('../services/orderService', () => orderMocks)

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
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
}

describe('OrderDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orderMocks.getOrderDetails.mockResolvedValue([])
  })

  it('muestra teléfono y WhatsApp, sin mostrar DNI ni email', async () => {
    render(<OrderDrawer order={baseOrder} onClose={vi.fn()} onUpdated={vi.fn()} />)

    expect(screen.getByText('+54 9 11 2345-6789')).toBeInTheDocument()
    expect(screen.queryByText('DNI')).not.toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'Contactar por WhatsApp' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link.getAttribute('href')).toContain('5491123456789')
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain('Hola Cliente, nos comunicamos por tu pedido PED-TEST.')
    await screen.findByText('Este pedido no tiene productos registrados.')
  })

  it('tolera un pedido antiguo sin teléfono y deshabilita WhatsApp', async () => {
    render(<OrderDrawer order={{ ...baseOrder, telefono: null }} onClose={vi.fn()} onUpdated={vi.fn()} />)

    expect(screen.getByText('Sin teléfono registrado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contactar por WhatsApp' })).toBeDisabled()
    await screen.findByText('Este pedido no tiene productos registrados.')
  })

  it('permite completar una contraentrega pendiente de coordinación', async () => {
    const onUpdated = vi.fn()
    const completedOrder = { ...baseOrder, estado: 'completado' as const }
    orderMocks.updateOrderStatus.mockResolvedValue(completedOrder)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<OrderDrawer order={baseOrder} onClose={vi.fn()} onUpdated={onUpdated} />)

    fireEvent.click(screen.getByRole('button', { name: 'Marcar como completado' }))
    await waitFor(() => expect(orderMocks.updateOrderStatus).toHaveBeenCalledWith(baseOrder.id, 'completado'))
    expect(onUpdated).toHaveBeenCalledWith(completedOrder)
    confirmSpy.mockRestore()
  })
})
