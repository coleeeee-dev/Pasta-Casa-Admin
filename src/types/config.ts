export interface BusinessConfig {
  id: number
  nombre_negocio: string
  whatsapp: string
  cbu: string
  identificacion_fiscal: string
  titular: string
  horas_limite_pago: number
  updated_at: string
}

export type BusinessConfigChanges = Omit<BusinessConfig, 'id' | 'updated_at'>

export type BusinessConfigUpdate = BusinessConfigChanges & {
  updated_at: string
}
