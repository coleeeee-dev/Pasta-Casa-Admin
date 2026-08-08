import { supabase } from '../lib/supabase'
import type { Order, OrderDetail, OrderStatus } from '../types/database'

const ORDER_COLUMNS = 'id,codigo,nombre,apellido,dni,email,total,estado,created_at,updated_at'

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  let query = supabase.from('pedidos').select(ORDER_COLUMNS).order('created_at', { ascending: false })
  if (status) query = query.eq('estado', status)

  const { data, error } = await query
  if (error) throw new Error('No se pudieron cargar los pedidos')
  return (data ?? []) as Order[]
}

export async function getOrderDetails(orderId: Order['id']): Promise<OrderDetail[]> {
  const { data, error } = await supabase
    .from('detalle_pedido')
    .select('id,pedido_id,producto_id,nombre_producto,cantidad_docenas,precio_unitario,subtotal,created_at')
    .eq('pedido_id', orderId)
    .order('created_at', { ascending: true })

  if (error) throw new Error('No se pudo cargar el detalle del pedido')
  return (data ?? []) as OrderDetail[]
}

export const buildOrderStatusUpdate = (status: OrderStatus) => ({
  estado: status,
  updated_at: new Date().toISOString(),
})

export async function updateOrderStatus(orderId: Order['id'], status: OrderStatus): Promise<Order> {
  const { data, error } = await supabase
    .from('pedidos')
    .update(buildOrderStatusUpdate(status))
    .eq('id', orderId)
    .select(ORDER_COLUMNS)
    .single()

  if (error) throw new Error('Supabase rechazó el cambio de estado')
  return data as Order
}
