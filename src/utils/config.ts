import type { BusinessConfigChanges } from '../types/config'

export type ConfigField = keyof BusinessConfigChanges
export type ConfigValidationErrors = Partial<Record<ConfigField, string>>

export function validateBusinessConfig(changes: BusinessConfigChanges): ConfigValidationErrors {
  const errors: ConfigValidationErrors = {}
  const businessName = changes.nombre_negocio.trim()
  const whatsappDigits = changes.whatsapp.replace(/\D/g, '')
  const cbu = changes.cbu.trim()
  const taxId = changes.identificacion_fiscal.trim()
  const owner = changes.titular.trim()

  if (businessName.length < 2) errors.nombre_negocio = 'El nombre debe tener al menos 2 caracteres'
  else if (businessName.length > 80) errors.nombre_negocio = 'El nombre no puede superar los 80 caracteres'

  if (whatsappDigits.length < 8 || whatsappDigits.length > 15) {
    errors.whatsapp = 'WhatsApp debe contener entre 8 y 15 dígitos'
  }

  if (!/^\d{22}$/.test(cbu)) errors.cbu = 'El CBU debe contener exactamente 22 dígitos, sin letras'
  if (!taxId) errors.identificacion_fiscal = 'La identificación fiscal es obligatoria'
  if (owner.length < 2) errors.titular = 'El titular debe tener al menos 2 caracteres'

  if (!Number.isInteger(changes.horas_limite_pago) || changes.horas_limite_pago < 1 || changes.horas_limite_pago > 72) {
    errors.horas_limite_pago = 'El plazo debe ser un número entero entre 1 y 72 horas'
  }

  return errors
}

export const hasConfigValidationErrors = (errors: ConfigValidationErrors) => Object.keys(errors).length > 0
