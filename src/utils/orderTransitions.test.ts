import type { Order } from '../types/database'
import { getAvailableOrderActions, getStockReservationLabel } from './orderTransitions'

const order = (estado: Order['estado'], metodo_pago: Order['metodo_pago']): Pick<Order, 'estado' | 'metodo_pago'> => ({ estado, metodo_pago })

describe('flujos de estados', () => {
  it('coordina la contraentrega antes de permitir completarla', () => {
    expect(getAvailableOrderActions(order('pendiente_coordinacion', 'contraentrega'))).toEqual(['pedido_confirmado', 'cancelado'])
    expect(getAvailableOrderActions(order('pedido_confirmado', 'contraentrega'))).toEqual(['completado', 'cancelado'])
  })

  it('conserva el flujo de transferencia', () => {
    expect(getAvailableOrderActions(order('pendiente_pago', 'transferencia'))).toEqual(['esperando_validacion', 'cancelado'])
    expect(getAvailableOrderActions(order('esperando_validacion', 'transferencia'))).toEqual(['pago_confirmado', 'cancelado'])
    expect(getAvailableOrderActions(order('pago_confirmado', 'transferencia'))).toEqual(['completado', 'cancelado'])
  })

  it('no ofrece completar ni cancelar pedidos terminales', () => {
    expect(getAvailableOrderActions(order('cancelado', 'transferencia'))).toEqual([])
    expect(getAvailableOrderActions(order('completado', 'contraentrega'))).toEqual([])
  })

  it('los estados iniciales no permiten completar directamente', () => {
    expect(getAvailableOrderActions(order('pendiente_pago', 'transferencia'))).not.toContain('completado')
    expect(getAvailableOrderActions(order('pendiente_coordinacion', 'contraentrega'))).not.toContain('completado')
  })

  it('presenta el estado de la reserva sin permitir editarlo', () => {
    expect(getStockReservationLabel({ estado: 'pendiente_pago', stock_reservado: true })).toBe('Stock reservado')
    expect(getStockReservationLabel({ estado: 'completado', stock_reservado: false })).toBe('Venta finalizada')
    expect(getStockReservationLabel({ estado: 'cancelado', stock_reservado: false })).toBe('Stock liberado')
  })
})
