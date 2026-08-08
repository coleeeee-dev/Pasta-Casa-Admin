import { formatOrderStatus, formatPaymentMethod } from './formatters'

describe('formatOrderStatus', () => {
  it('muestra etiquetas legibles para todos los estados', () => {
    expect(formatOrderStatus('pendiente_pago')).toBe('Pendiente de pago')
    expect(formatOrderStatus('pendiente_coordinacion')).toBe('Pendiente de coordinación')
    expect(formatOrderStatus('esperando_validacion')).toBe('Esperando validación')
    expect(formatOrderStatus('pago_confirmado')).toBe('Pago confirmado')
    expect(formatOrderStatus('completado')).toBe('Completado')
    expect(formatOrderStatus('cancelado')).toBe('Cancelado')
  })

  it('muestra los métodos de pago con etiquetas amigables', () => {
    expect(formatPaymentMethod('transferencia')).toBe('Transferencia bancaria')
    expect(formatPaymentMethod('contraentrega')).toBe('Pago contraentrega')
  })

  it('tolera métodos de pago de versiones anteriores', () => {
    expect(formatPaymentMethod('mercado_pago')).toBe('Mercado pago')
    expect(formatPaymentMethod(null)).toBe('Sin método registrado')
  })
})
