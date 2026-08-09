const orderMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  update: vi.fn(),
  selectFromTable: vi.fn(),
  eqAfterUpdate: vi.fn(),
  selectAfterUpdate: vi.fn(),
  singleAfterUpdate: vi.fn(),
  eqAfterSelect: vi.fn(),
  singleAfterSelect: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { rpc: orderMocks.rpc, from: orderMocks.from },
}))

import { buildOrderStatusUpdate, cancelOrder, completeOrder, updateOrderStatus } from './orderService'

const updatedOrder = {
  id: 123,
  codigo: 'PED-TEST',
  nombre: 'Cliente',
  apellido: 'Prueba',
  telefono: null,
  metodo_pago: 'transferencia',
  total: 1000,
  estado: 'cancelado',
  stock_reservado: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
}

describe('servicio de pedidos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    orderMocks.from.mockReturnValue({ update: orderMocks.update, select: orderMocks.selectFromTable })
    orderMocks.update.mockReturnValue({ eq: orderMocks.eqAfterUpdate })
    orderMocks.eqAfterUpdate.mockReturnValue({ select: orderMocks.selectAfterUpdate })
    orderMocks.selectAfterUpdate.mockReturnValue({ single: orderMocks.singleAfterUpdate })
    orderMocks.selectFromTable.mockReturnValue({ eq: orderMocks.eqAfterSelect })
    orderMocks.eqAfterSelect.mockReturnValue({ single: orderMocks.singleAfterSelect })
    orderMocks.rpc.mockResolvedValue({ data: null, error: null })
    orderMocks.singleAfterSelect.mockResolvedValue({ data: updatedOrder, error: null })
    orderMocks.singleAfterUpdate.mockResolvedValue({ data: { ...updatedOrder, estado: 'pago_confirmado' }, error: null })
  })

  it('cancelar llama cancelar_pedido_admin y nunca ejecuta update directo', async () => {
    await cancelOrder(123)

    expect(orderMocks.rpc).toHaveBeenCalledWith('cancelar_pedido_admin', { p_pedido_id: 123 })
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('completar llama completar_pedido_admin y nunca ejecuta update directo', async () => {
    orderMocks.singleAfterSelect.mockResolvedValue({ data: { ...updatedOrder, estado: 'completado' }, error: null })
    await completeOrder(123)

    expect(orderMocks.rpc).toHaveBeenCalledWith('completar_pedido_admin', { p_pedido_id: 123 })
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('los estados intermedios continúan usando update normal con dos campos', async () => {
    await updateOrderStatus(123, 'pago_confirmado')

    expect(orderMocks.rpc).not.toHaveBeenCalled()
    expect(orderMocks.update).toHaveBeenCalledOnce()
    const payload = orderMocks.update.mock.calls[0][0]
    expect(payload.estado).toBe('pago_confirmado')
    expect(Object.keys(payload).sort()).toEqual(['estado', 'updated_at'])
    expect(payload).not.toHaveProperty('stock_reservado')
  })

  it('rechaza el uso del update normal para estados terminales', async () => {
    await expect(updateOrderStatus(123, 'cancelado')).rejects.toThrow('inventario')
    await expect(updateOrderStatus(123, 'completado')).rejects.toThrow('inventario')
    expect(orderMocks.update).not.toHaveBeenCalled()
    expect(orderMocks.rpc).not.toHaveBeenCalled()
  })

  it('propaga un error RPC sin consultar ni actualizar el pedido', async () => {
    orderMocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } })

    await expect(cancelOrder(123)).rejects.toThrow('cancelación')
    expect(orderMocks.from).not.toHaveBeenCalled()
    expect(orderMocks.update).not.toHaveBeenCalled()
  })

  it('el constructor de estados intermedios no incluye la reserva', () => {
    expect(Object.keys(buildOrderStatusUpdate('esperando_validacion')).sort()).toEqual(['estado', 'updated_at'])
  })
})
