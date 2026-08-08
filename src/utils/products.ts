import type { Product } from '../types/database'

export type ProductAvailability = 'available' | 'out-of-stock' | 'paused'

export interface ProductAvailabilityView {
  key: ProductAvailability
  label: 'Disponible' | 'Sin stock' | 'Pausado'
}

export function getProductAvailability(product: Pick<Product, 'activo' | 'stock_docenas'>): ProductAvailabilityView {
  if (!product.activo) return { key: 'paused', label: 'Pausado' }
  if (Number(product.stock_docenas) === 0) return { key: 'out-of-stock', label: 'Sin stock' }
  return { key: 'available', label: 'Disponible' }
}
