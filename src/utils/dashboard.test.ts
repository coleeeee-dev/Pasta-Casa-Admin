import type { Order } from '../types/database'
import { calculateDashboardMetrics } from './dashboard'

const order = (estado: Order['estado'], total: number): Order => ({
  id: `${estado}-${total}`,
  codigo: 'TEST', nombre: 'Cliente', apellido: 'Prueba', dni: '', email: '', total, estado,
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
})

describe('calculateDashboardMetrics', () => {
  it('calcula cantidades y suma solo los pedidos completados', () => {
    const metrics = calculateDashboardMetrics([
      order('pendiente_pago', 100), order('completado', 500), order('completado', 250), order('cancelado', 900),
    ])
    expect(metrics.total).toBe(4)
    expect(metrics.byStatus.completado).toBe(2)
    expect(metrics.byStatus.pendiente_pago).toBe(1)
    expect(metrics.completedAmount).toBe(750)
  })
})
