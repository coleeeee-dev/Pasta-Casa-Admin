import { useState } from 'react'
import { OrderDrawer } from '../components/OrderDrawer'
import { EmptyState, ErrorState, Spinner } from '../components/StateViews'
import { StatusBadge } from '../components/StatusBadge'
import { useAsyncData } from '../hooks/useAsyncData'
import { getOrders } from '../services/orderService'
import type { Order, OrderStatus } from '../types/database'
import { calculateDashboardMetrics } from '../utils/dashboard'
import { formatCurrency, formatDate, formatOrderStatus } from '../utils/formatters'

const metricStatuses: OrderStatus[] = ['pendiente_pago', 'pendiente_coordinacion', 'esperando_validacion', 'pago_confirmado', 'pedido_confirmado', 'completado', 'cancelado']

export function DashboardPage() {
  const { data: orders, setData: setOrders, loading, error, reload } = useAsyncData(getOrders, [])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const metrics = calculateDashboardMetrics(orders ?? [])
  const recentOrders = (orders ?? []).slice(0, 5)

  const updateOrder = (updated: Order) => {
    setOrders((current) => current?.map((order) => order.id === updated.id ? updated : order) ?? [updated])
    setSelectedOrder(updated)
  }

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Resumen general</p><h2>Dashboard</h2><p>El estado de la operación de Pasta Casa, de un vistazo.</p></div></div>
      {loading ? <Spinner label="Cargando indicadores…" /> : error ? <ErrorState message={error} onRetry={reload} /> : (
        <>
          <section className="metric-grid" aria-label="Métricas por estado">
            {metricStatuses.map((status) => (
              <article className={`metric-card metric-${status}`} key={status}>
                <span className="metric-dot" /><span>{formatOrderStatus(status)}</span><strong>{metrics.byStatus[status]}</strong><small>pedidos</small>
              </article>
            ))}
          </section>
          <section className="summary-grid">
            <article className="summary-card"><span>Total de pedidos</span><strong>{metrics.total}</strong><small>desde el inicio</small></article>
            <article className="summary-card featured"><span>Monto completado</span><strong>{formatCurrency(metrics.completedAmount)}</strong><small>solo pedidos completados</small></article>
          </section>
          <section className="panel-card">
            <div className="section-heading"><div><h3>Pedidos recientes</h3><p>Los últimos 5 pedidos registrados.</p></div></div>
            {recentOrders.length === 0 ? <EmptyState title="Todavía no hay pedidos" description="Los pedidos nuevos aparecerán en esta sección." /> : (
              <div className="table-wrap"><table><thead><tr><th>Código</th><th>Cliente</th><th>Total</th><th>Fecha</th><th>Estado</th></tr></thead>
                <tbody>{recentOrders.map((order) => <tr key={order.id} className="clickable-row" tabIndex={0} onClick={() => setSelectedOrder(order)} onKeyDown={(event) => { if (event.key === 'Enter') setSelectedOrder(order) }}>
                  <td><strong>{order.codigo}</strong></td><td>{order.nombre} {order.apellido}</td><td>{formatCurrency(Number(order.total))}</td><td>{formatDate(order.created_at)}</td><td><StatusBadge status={order.estado} /></td>
                </tr>)}</tbody></table></div>
            )}
          </section>
        </>
      )}
      {selectedOrder && <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdated={updateOrder} onRefreshOrders={reload} />}
    </div>
  )
}
