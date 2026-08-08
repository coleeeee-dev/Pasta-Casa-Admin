import { useState } from 'react'
import { OrderDrawer } from '../components/OrderDrawer'
import { EmptyState, ErrorState, Spinner } from '../components/StateViews'
import { StatusBadge } from '../components/StatusBadge'
import { useAsyncData } from '../hooks/useAsyncData'
import { getOrders } from '../services/orderService'
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types/database'
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentMethod } from '../utils/formatters'

export function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | 'todos'>('todos')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { data: orders, setData: setOrders, loading, error, reload } = useAsyncData(() => getOrders(filter === 'todos' ? undefined : filter), [filter])

  const updateOrder = (updated: Order) => {
    setOrders((current) => {
      if (!current) return [updated]
      if (filter !== 'todos' && updated.estado !== filter) return current.filter((order) => order.id !== updated.id)
      return current.map((order) => order.id === updated.id ? updated : order)
    })
    setSelectedOrder(updated)
  }

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Operaciones</p><h2>Pedidos</h2><p>Consultá cada venta y avanzá su estado de forma controlada.</p></div><span className="count-pill">{orders?.length ?? 0} pedidos</span></div>
      <div className="filter-bar" role="group" aria-label="Filtrar pedidos por estado">
        <button className={filter === 'todos' ? 'active' : ''} onClick={() => setFilter('todos')}>Todos</button>
        {ORDER_STATUSES.map((status) => <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{formatOrderStatus(status)}</button>)}
      </div>
      <section className="panel-card orders-panel">
        {loading ? <Spinner label="Cargando pedidos…" /> : error ? <ErrorState message={error} onRetry={reload} /> : !orders?.length ? (
          <EmptyState title="No hay pedidos en este estado" description="Probá seleccionando otro filtro." />
        ) : (
          <div className="table-wrap"><table><thead><tr><th>Código</th><th>Fecha</th><th>Cliente</th><th>Método de pago</th><th>Total</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.codigo}</strong></td><td>{formatDate(order.created_at)}</td><td>{order.nombre} {order.apellido}</td><td>{formatPaymentMethod(order.metodo_pago)}</td><td>{formatCurrency(Number(order.total))}</td><td><StatusBadge status={order.estado} /></td><td className="actions-cell"><button className="button button-secondary button-small" onClick={() => setSelectedOrder(order)}>Ver detalle</button></td></tr>)}</tbody></table></div>
        )}
      </section>
      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={updateOrder} />}
    </div>
  )
}
