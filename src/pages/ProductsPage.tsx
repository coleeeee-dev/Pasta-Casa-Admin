import { useState } from 'react'
import { EmptyState, ErrorState, Spinner } from '../components/StateViews'
import { useAsyncData } from '../hooks/useAsyncData'
import { getProducts, updateProduct, validateProductChanges, type ProductChanges } from '../services/productService'
import type { Product } from '../types/database'
import { formatCurrency } from '../utils/formatters'

function ProductEditor({ product, onSaved }: { product: Product; onSaved: (product: Product) => void }) {
  const [values, setValues] = useState<ProductChanges>({ precio: Number(product.precio), stock_docenas: Number(product.stock_docenas), activo: product.activo })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const validationError = validateProductChanges(values)

  const save = async () => {
    if (validationError) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await updateProduct(product.id, values)
      onSaved(updated)
      setMessage({ type: 'success', text: 'Producto actualizado.' })
    } catch (saveError) {
      setMessage({ type: 'error', text: saveError instanceof Error ? saveError.message : 'No se pudo guardar' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="product-card">
      <div className="product-card-top"><div className="product-code">{product.codigo}</div><span className={`product-state ${values.activo ? 'active' : 'inactive'}`}>{values.activo ? 'Activo' : 'Inactivo'}</span></div>
      <div><h3>{product.nombre}</h3><p className="muted">Precio actual: {formatCurrency(Number(product.precio))}</p></div>
      <div className="product-fields">
        <label>Precio<input type="number" min="0" step="0.01" value={values.precio} onChange={(event) => setValues((current) => ({ ...current, precio: Number(event.target.value) }))} /></label>
        <label>Stock en docenas<input type="number" min="0" step="1" value={values.stock_docenas} onChange={(event) => setValues((current) => ({ ...current, stock_docenas: Number(event.target.value) }))} /></label>
      </div>
      <label className="switch-row"><span><strong>Disponible para la venta</strong><small>Controla el estado activo del producto.</small></span><input type="checkbox" checked={values.activo} onChange={(event) => setValues((current) => ({ ...current, activo: event.target.checked }))} /><span className="switch" /></label>
      {validationError && <p className="field-error" role="alert">{validationError}</p>}
      {message && <p className={message.type === 'success' ? 'field-success' : 'field-error'} role="status">{message.text}</p>}
      <button className="button button-primary" disabled={saving || Boolean(validationError)} onClick={() => void save()}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
    </article>
  )
}

export function ProductsPage() {
  const { data: products, setData: setProducts, loading, error, reload } = useAsyncData(getProducts, [])
  const replaceProduct = (updated: Product) => setProducts((current) => current?.map((product) => product.id === updated.id ? updated : product) ?? [updated])

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Catálogo</p><h2>Productos</h2><p>Actualizá precio, stock y disponibilidad. Los datos base permanecen protegidos.</p></div></div>
      <div className="info-banner"><span aria-hidden="true">i</span><p>En esta versión no se pueden crear ni eliminar productos, ni modificar su código, nombre o descripción.</p></div>
      {loading ? <Spinner label="Cargando productos…" /> : error ? <ErrorState message={error} onRetry={reload} /> : !products?.length ? (
        <EmptyState title="No hay productos" description="No se encontraron productos disponibles para administrar." />
      ) : <section className="products-grid">{products.map((product) => <ProductEditor key={product.id} product={product} onSaved={replaceProduct} />)}</section>}
    </div>
  )
}
