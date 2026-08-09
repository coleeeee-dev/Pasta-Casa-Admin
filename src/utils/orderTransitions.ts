import type { Order, OrderStatus } from '../types/database'

export function getAvailableOrderActions(order: Pick<Order, 'estado' | 'metodo_pago'>): OrderStatus[] {
  if (order.estado === 'pendiente_coordinacion') return ['pedido_confirmado', 'cancelado']
  if (order.estado === 'pendiente_pago') return ['esperando_validacion', 'cancelado']
  if (order.estado === 'esperando_validacion') return ['pago_confirmado', 'cancelado']
  if (order.estado === 'pago_confirmado') return ['completado', 'cancelado']
  if (order.estado === 'pedido_confirmado') return ['completado', 'cancelado']
  return []
}

export function getStockReservationLabel(order: Pick<Order, 'estado' | 'stock_reservado'>): string | null {
  if (order.stock_reservado) return 'Stock reservado'
  if (order.estado === 'completado') return 'Venta finalizada'
  if (order.estado === 'cancelado') return 'Stock liberado'
  return null
}
