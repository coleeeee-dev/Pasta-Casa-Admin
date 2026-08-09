import type { Order } from '../types/database'
import { calculateDashboardMetrics } from './dashboard'

const order = (estado: Order['estado'], total: number): Order => ({
  id: `${estado}-${total}`,
  codigo: 'TEST', nombre: 'Cliente', apellido: 'Prueba', telefono: null, metodo_pago: 'transferencia', total, estado,
  stock_reservado: estado !== 'completado' && estado !== 'cancelado',
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
})

describe('calculateDashboardMetrics', () => {
  it('calcula cantidades y suma solo los pedidos completados', () => {
    const metrics = calculateDashboardMetrics([
      order('pendiente_pago', 100), order('pendiente_coordinacion', 300), order('completado', 500),
      order('completado', 250), order('pago_confirmado', 400), order('cancelado', 900),
    ])
    expect(metrics.total).toBe(6)
    expect(metrics.byStatus.completado).toBe(2)
    expect(metrics.byStatus.pendiente_pago).toBe(1)
    expect(metrics.byStatus.pendiente_coordinacion).toBe(1)
    expect(metrics.completedAmount).toBe(750)
  })
})
