import type { Order, OrderStatus } from '../types/database'

export function getAvailableOrderActions(order: Pick<Order, 'estado' | 'metodo_pago'>): OrderStatus[] {
  if (order.estado === 'pendiente_coordinacion') return ['completado', 'cancelado']
  if (order.estado === 'pendiente_pago') return ['esperando_validacion', 'cancelado']
  if (order.estado === 'esperando_validacion') return ['pago_confirmado', 'cancelado']
  if (order.estado === 'pago_confirmado') return ['completado', 'cancelado']
  return []
}
