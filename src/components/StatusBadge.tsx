import type { OrderStatus } from '../types/database'
import { formatOrderStatus } from '../utils/formatters'

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status}`}>{formatOrderStatus(status)}</span>
}
