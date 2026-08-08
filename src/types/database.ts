export const ORDER_STATUSES = [
  'pendiente_pago',
  'pendiente_coordinacion',
  'esperando_validacion',
  'pago_confirmado',
  'completado',
  'cancelado',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]
export type PaymentMethod = 'transferencia' | 'contraentrega'

export interface Order {
  id: string | number
  codigo: string
  nombre: string
  apellido: string
  telefono: string | null
  metodo_pago: PaymentMethod
  total: number
  estado: OrderStatus
  created_at: string
  updated_at: string
}

export interface OrderDetail {
  id: string | number
  pedido_id: string | number
  producto_id: string | number | null
  nombre_producto: string
  cantidad_docenas: number
  precio_unitario: number
  subtotal: number
  created_at: string
}

export interface Product {
  id: string | number
  codigo: string
  nombre: string
  descripcion: string | null
  precio: number
  stock_docenas: number
  imagen_url: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

export interface DashboardMetrics {
  total: number
  completedAmount: number
  byStatus: Record<OrderStatus, number>
}
