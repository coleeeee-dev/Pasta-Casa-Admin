import type { OrderStatus, PaymentMethod } from '../types/database'

const statusLabels: Record<OrderStatus, string> = {
  pendiente_pago: 'Pendiente de pago',
  pendiente_coordinacion: 'Pendiente de coordinación',
  esperando_validacion: 'Esperando validación',
  pago_confirmado: 'Pago confirmado',
  pedido_confirmado: 'Pedido confirmado',
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

const paymentMethodLabels: Record<PaymentMethod, string> = {
  transferencia: 'Transferencia bancaria',
  contraentrega: 'Pago contraentrega',
}

export const formatPaymentMethod = (method: PaymentMethod | string | null) => {
  if (!method) return 'Sin método registrado'
  if (method in paymentMethodLabels) return paymentMethodLabels[method as PaymentMethod]

  const legacyLabel = method.trim().replace(/[_-]+/g, ' ')
  if (!legacyLabel) return 'Sin método registrado'
  return legacyLabel.charAt(0).toLocaleUpperCase('es-AR') + legacyLabel.slice(1)
}
