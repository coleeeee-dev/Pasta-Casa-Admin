import { ORDER_STATUSES, type DashboardMetrics, type Order } from '../types/database'

export const calculateDashboardMetrics = (orders: Order[]): DashboardMetrics => {
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as DashboardMetrics['byStatus']

  return orders.reduce<DashboardMetrics>(
    (metrics, order) => {
      metrics.total += 1
      metrics.byStatus[order.estado] += 1
      if (order.estado === 'completado') metrics.completedAmount += Number(order.total)
      return metrics
    },
    { total: 0, completedAmount: 0, byStatus },
  )
}
