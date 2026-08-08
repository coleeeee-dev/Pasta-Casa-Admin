import { formatOrderStatus } from './formatters'

describe('formatOrderStatus', () => {
  it('muestra etiquetas legibles para todos los estados', () => {
    expect(formatOrderStatus('pendiente_pago')).toBe('Pendiente de pago')
    expect(formatOrderStatus('esperando_validacion')).toBe('Esperando validación')
    expect(formatOrderStatus('pago_confirmado')).toBe('Pago confirmado')
    expect(formatOrderStatus('completado')).toBe('Completado')
    expect(formatOrderStatus('cancelado')).toBe('Cancelado')
  })
})
