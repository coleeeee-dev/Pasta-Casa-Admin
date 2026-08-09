import { supabase } from '../lib/supabase'
import type { Order, OrderDetail, OrderStatus } from '../types/database'

const ORDER_COLUMNS = 'id,codigo,nombre,apellido,telefono,metodo_pago,total,estado,stock_reservado,created_at,updated_at'

async function getOrderById(orderId: Order['id']): Promise<Order> {
  const { data, error } = await supabase.from('pedidos').select(ORDER_COLUMNS).eq('id', orderId).single()
  if (error) throw new Error('El pedido se actualizó, pero no se pudo recuperar su estado actual')
  return data as Order
}

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

export async function advanceOrderStatus(orderId: Order['id'], status: OrderStatus): Promise<Order> {
  if (status === 'cancelado' || status === 'completado') {
    throw new Error('Los estados terminales deben gestionarse mediante su operación de inventario')
  }

  const { error } = await supabase.rpc('avanzar_estado_pedido_admin', {
    p_pedido_id: orderId,
    p_nuevo_estado: status,
  })
  if (error) throw new Error('Supabase rechazó la transición de estado')
  return getOrderById(orderId)
}

export async function cancelOrder(orderId: Order['id']): Promise<Order> {
  const { error } = await supabase.rpc('cancelar_pedido_admin', { p_pedido_id: orderId })
  if (error) throw new Error('Supabase rechazó la cancelación del pedido')
  return getOrderById(orderId)
}

export async function completeOrder(orderId: Order['id']): Promise<Order> {
  const { error } = await supabase.rpc('completar_pedido_admin', { p_pedido_id: orderId })
  if (error) throw new Error('Supabase rechazó la finalización del pedido')
  return getOrderById(orderId)
}
