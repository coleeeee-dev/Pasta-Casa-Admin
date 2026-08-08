import { supabase } from '../lib/supabase'
import type { Product } from '../types/database'

export interface ProductChanges {
  precio: number
  stock_docenas: number
  activo: boolean
}

export function validateProductChanges(changes: ProductChanges): string | null {
  if (!Number.isFinite(changes.precio) || changes.precio <= 0) return 'El precio debe ser un número mayor que 0'
  if (!Number.isInteger(changes.stock_docenas) || changes.stock_docenas < 0) {
    return 'El stock debe ser un número entero mayor o igual a 0'
  }
  return null
}

export const buildProductUpdate = (changes: ProductChanges) => ({
  precio: changes.precio,
  stock_docenas: changes.stock_docenas,
  activo: changes.activo,
  updated_at: new Date().toISOString(),
})

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('id,codigo,nombre,descripcion,precio,stock_docenas,imagen_url,activo,created_at,updated_at')
    .order('created_at', { ascending: true })

  if (error) throw new Error('No se pudieron cargar los productos')
  return (data ?? []) as Product[]
}

export async function updateProduct(productId: Product['id'], changes: ProductChanges): Promise<Product> {
  const validationError = validateProductChanges(changes)
  if (validationError) throw new Error(validationError)

  const { data, error } = await supabase
    .from('productos')
    .update(buildProductUpdate(changes))
    .eq('id', productId)
    .select('id,codigo,nombre,descripcion,precio,stock_docenas,imagen_url,activo,created_at,updated_at')
    .single()

  if (error) throw new Error('Supabase rechazó la actualización del producto')
  return data as Product
}
