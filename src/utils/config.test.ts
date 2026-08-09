import type { BusinessConfigChanges } from '../types/config'
import { validateBusinessConfig } from './config'

const validConfig: BusinessConfigChanges = {
  nombre_negocio: 'Pasta Casa',
  whatsapp: '+54 9 3865 38-5579',
  cbu: '1234567890123456789012',
  identificacion_fiscal: '20-42468452-0',
  titular: 'Titular de prueba',
  horas_limite_pago: 24,
}

describe('validación de configuración', () => {
  it('rechaza un CBU que no tenga 22 dígitos', () => {
    expect(validateBusinessConfig({ ...validConfig, cbu: '1234' }).cbu).toBeTruthy()
  })

  it('rechaza un CBU con letras', () => {
    expect(validateBusinessConfig({ ...validConfig, cbu: '12345678901234567890AB' }).cbu).toBeTruthy()
  })

  it('rechaza un WhatsApp con menos de 8 o más de 15 dígitos', () => {
    expect(validateBusinessConfig({ ...validConfig, whatsapp: '1234567' }).whatsapp).toBeTruthy()
    expect(validateBusinessConfig({ ...validConfig, whatsapp: '1234567890123456' }).whatsapp).toBeTruthy()
  })

  it('rechaza horas cero, decimales o mayores que 72', () => {
    expect(validateBusinessConfig({ ...validConfig, horas_limite_pago: 0 }).horas_limite_pago).toBeTruthy()
    expect(validateBusinessConfig({ ...validConfig, horas_limite_pago: 2.5 }).horas_limite_pago).toBeTruthy()
    expect(validateBusinessConfig({ ...validConfig, horas_limite_pago: 73 }).horas_limite_pago).toBeTruthy()
  })

  it('rechaza un nombre vacío', () => {
    expect(validateBusinessConfig({ ...validConfig, nombre_negocio: '' }).nombre_negocio).toBeTruthy()
  })

  it('acepta una configuración válida y conserva el formato de WhatsApp', () => {
    expect(validateBusinessConfig(validConfig)).toEqual({})
    expect(validConfig.whatsapp).toBe('+54 9 3865 38-5579')
  })
})
