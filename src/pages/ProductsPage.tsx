import { useState } from 'react'
import { ProductEditorModal } from '../components/ProductEditorModal'
import { EmptyState, ErrorState, Spinner } from '../components/StateViews'
import { useAsyncData } from '../hooks/useAsyncData'
import { getProducts } from '../services/productService'
import type { Product } from '../types/database'
import { formatCurrency, formatDate } from '../utils/formatters'
import { getProductAvailability } from '../utils/products'

export function ProductsPage() {
  const { data: products, setData: setProducts, loading, error, reload } = useAsyncData(getProducts, [])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const saveProduct = (updated: Product) => {
    setProducts((current) => current?.map((product) => product.id === updated.id ? updated : product) ?? [updated])
    setSelectedProduct(null)
    setSuccess('Producto actualizado correctamente')
  }

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Catálogo</p><h2>Productos</h2><p>Gestioná precio, stock actual y disponibilidad para la venta.</p></div><span className="count-pill">{products?.length ?? 0} productos</span></div>
      <div className="info-banner"><span aria-hidden="true">i</span><p>En esta versión no se pueden crear ni eliminar productos, ni modificar código, nombre, descripción o imagen.</p></div>
      {success && <div className="success-banner page-success" role="status">{success}</div>}

      <section className="panel-card products-panel">
        {loading ? <Spinner label="Cargando productos…" /> : error ? <ErrorState message={error} onRetry={reload} /> : !products?.length ? (
          <EmptyState title="No hay productos" description="No se encontraron productos disponibles para administrar." />
        ) : (
          <div className="table-wrap"><table className="products-table">
            <thead><tr><th>Código</th><th>Nombre</th><th>Precio actual</th><th>Stock actual</th><th>Estado</th><th>Última actualización</th><th><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>{products.map((product) => {
              const availability = getProductAvailability(product)
              return <tr key={product.id}>
                <td><span className="product-code">{product.codigo}</span></td>
                <td><strong>{product.nombre}</strong></td>
                <td className="product-price">{formatCurrency(Number(product.precio))}</td>
                <td>{product.stock_docenas} docena{Number(product.stock_docenas) === 1 ? '' : 's'}</td>
                <td><div className="product-status-stack">{product.activo && <small>Activo</small>}<span className={`product-availability product-availability-${availability.key}`}>{availability.label}</span></div></td>
                <td>{formatDate(product.updated_at)}</td>
                <td className="actions-cell"><button className="button button-secondary button-small" onClick={() => { setSuccess(null); setSelectedProduct(product) }}>Editar</button></td>
              </tr>
            })}</tbody>
          </table></div>
        )}
      </section>

      {selectedProduct && <ProductEditorModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onSaved={saveProduct} />}
    </div>
  )
}
