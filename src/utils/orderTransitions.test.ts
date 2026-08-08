import type { Order } from '../types/database'
import { getAvailableOrderActions } from './orderTransitions'

const order = (estado: Order['estado'], metodo_pago: Order['metodo_pago']): Pick<Order, 'estado' | 'metodo_pago'> => ({ estado, metodo_pago })

describe('flujos de estados', () => {
  it('permite completar o cancelar una contraentrega pendiente de coordinación', () => {
    expect(getAvailableOrderActions(order('pendiente_coordinacion', 'contraentrega'))).toEqual(['completado', 'cancelado'])
  })

  it('conserva el flujo de transferencia', () => {
    expect(getAvailableOrderActions(order('pendiente_pago', 'transferencia'))).toEqual(['esperando_validacion', 'cancelado'])
    expect(getAvailableOrderActions(order('esperando_validacion', 'transferencia'))).toEqual(['pago_confirmado', 'cancelado'])
    expect(getAvailableOrderActions(order('pago_confirmado', 'transferencia'))).toEqual(['completado', 'cancelado'])
  })
})
