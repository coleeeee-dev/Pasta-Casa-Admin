import type { OrderStatus } from '../types/database'

const statusLabels: Record<OrderStatus, string> = {
  pendiente_pago: 'Pendiente de pago',
  esperando_validacion: 'Esperando validación',
  pago_confirmado: 'Pago confirmado',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(value)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export const formatOrderStatus = (status: OrderStatus) => statusLabels[status]
