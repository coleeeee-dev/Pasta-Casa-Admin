import { supabase } from '../lib/supabase'
import type { BusinessConfig, BusinessConfigChanges, BusinessConfigUpdate } from '../types/config'
import { hasConfigValidationErrors, validateBusinessConfig } from '../utils/config'

const CONFIG_COLUMNS = 'id,nombre_negocio,whatsapp,cbu,identificacion_fiscal,titular,horas_limite_pago,updated_at'

export async function getBusinessConfig(): Promise<BusinessConfig> {
  const { data, error } = await supabase
    .from('configuracion_publica')
    .select(CONFIG_COLUMNS)
    .eq('id', 1)
    .maybeSingle()

  if (error) throw new Error('No se pudo cargar la configuración pública')
  if (!data) throw new Error('No existe la fila administrativa configuracion_publica con id = 1')
  return data as BusinessConfig
}

export const buildBusinessConfigUpdate = (changes: BusinessConfigChanges): BusinessConfigUpdate => ({
  nombre_negocio: changes.nombre_negocio,
  whatsapp: changes.whatsapp,
  cbu: changes.cbu,
  identificacion_fiscal: changes.identificacion_fiscal,
  titular: changes.titular,
  horas_limite_pago: changes.horas_limite_pago,
  updated_at: new Date().toISOString(),
})

export async function updateBusinessConfig(changes: BusinessConfigChanges): Promise<BusinessConfig> {
  const validationErrors = validateBusinessConfig(changes)
  if (hasConfigValidationErrors(validationErrors)) {
    throw new Error(Object.values(validationErrors)[0] ?? 'La configuración contiene datos inválidos')
  }

  const { data, error } = await supabase
    .from('configuracion_publica')
    .update(buildBusinessConfigUpdate(changes))
    .eq('id', 1)
    .select(CONFIG_COLUMNS)
    .single()

  if (error) throw new Error('Supabase rechazó la actualización de la configuración')
  return data as BusinessConfig
}
