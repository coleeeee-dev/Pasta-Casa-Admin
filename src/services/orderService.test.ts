const orderMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { rpc: orderMocks.rpc, from: orderMocks.from },
}))

import { advanceOrderStatus, cancelOrder, completeOrder } from './orderService'

const updatedOrder = {
  id: 123,
  codigo: 'PED-TEST',
  nombre: 'Cliente',
  apellido: 'Prueba',
  telefono: null,
  metodo_pago: 'transferencia',
  total: 1000,
  estado: 'esperando_validacion',
  stock_reservado: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

describe('servicio de pedidos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orderMocks.from.mockReturnValue({ select: orderMocks.select, update: orderMocks.update })
    orderMocks.select.mockReturnValue({ eq: orderMocks.eq })
    orderMocks.eq.mockReturnValue({ single: orderMocks.single })
    orderMocks.rpc.mockResolvedValue({ data: null, error: null })
    orderMocks.single.mockResolvedValue({ data: updatedOrder, error: null })
  })

  it.each([
    ['pendiente_pago → esperando_validacion', 'esperando_validacion'],
    ['esperando_validacion → pago_confirmado', 'pago_confirmado'],
    ['pendiente_coordinacion → pedido_confirmado', 'pedido_confirmado'],
  ] as const)('%s utiliza avanzar_estado_pedido_admin', async (_label, newStatus) => {
    await advanceOrderStatus(123, newStatus)

    expect(orderMocks.rpc).toHaveBeenCalledWith('avanzar_estado_pedido_admin', {
      p_pedido_id: 123,
      p_nuevo_estado: newStatus,
    })
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('cancelar continúa usando cancelar_pedido_admin sin update directo', async () => {
    await cancelOrder(123)

    expect(orderMocks.rpc).toHaveBeenCalledWith('cancelar_pedido_admin', { p_pedido_id: 123 })
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('completar continúa usando completar_pedido_admin sin update directo', async () => {
    await completeOrder(123)

    expect(orderMocks.rpc).toHaveBeenCalledWith('completar_pedido_admin', { p_pedido_id: 123 })
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('no permite avanzar estados terminales mediante la RPC intermedia', async () => {
    await expect(advanceOrderStatus(123, 'cancelado')).rejects.toThrow('inventario')
    await expect(advanceOrderStatus(123, 'completado')).rejects.toThrow('inventario')
    expect(orderMocks.rpc).not.toHaveBeenCalled()
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('un error RPC no consulta ni actualiza el pedido', async () => {
    orderMocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } })

    await expect(advanceOrderStatus(123, 'esperando_validacion')).rejects.toThrow('transición')
    expect(orderMocks.from).not.toHaveBeenCalled()
    expect(orderMocks.update).not.toHaveBeenCalled()
  })
})
