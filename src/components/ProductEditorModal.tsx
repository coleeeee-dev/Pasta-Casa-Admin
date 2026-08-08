import { useEffect, useRef, useState, type FormEvent } from 'react'
import { updateProduct, validateProductChanges, type ProductChanges } from '../services/productService'
import type { Product } from '../types/database'

interface ProductEditorModalProps {
  product: Product
  onClose: () => void
  onSaved: (product: Product) => void
}

const DISCARD_MESSAGE = 'Tenés cambios sin guardar. ¿Querés descartarlos?'
const PAUSE_MESSAGE = 'Este producto dejará de aparecer disponible para los clientes.\n¿Deseás continuar?'

export function ProductEditorModal({ product, onClose, onSaved }: ProductEditorModalProps) {
  const [price, setPrice] = useState(String(product.precio))
  const [stock, setStock] = useState(String(product.stock_docenas))
  const [active, setActive] = useState(product.activo)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const savingRef = useRef(false)

  const changes: ProductChanges = {
    precio: price.trim() === '' ? Number.NaN : Number(price),
    stock_docenas: stock.trim() === '' ? Number.NaN : Number(stock),
    activo: active,
  }
  const validationError = validateProductChanges(changes)
  const isDirty = price !== String(product.precio) || stock !== String(product.stock_docenas) || active !== product.activo

  const requestClose = () => {
    if (savingRef.current) return
    if (isDirty && !window.confirm(DISCARD_MESSAGE)) return
    onClose()
  }

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  })

  const toggleActive = (nextActive: boolean) => {
    if (!nextActive && active && !window.confirm(PAUSE_MESSAGE)) return
    setActive(nextActive)
    setError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (validationError || savingRef.current) return

    savingRef.current = true
    setSaving(true)
    setError(null)
    try {
      onSaved(await updateProduct(product.id, changes))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo actualizar el producto')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div className="product-editor-layer" role="presentation">
      <button className="product-editor-backdrop" aria-label="Cerrar editor" onClick={requestClose} disabled={saving} />
      <section className="product-editor-modal" role="dialog" aria-modal="true" aria-labelledby="product-editor-title">
        <header className="product-editor-header">
          <div><p className="eyebrow">Edición de producto</p><h2 id="product-editor-title">{product.nombre}</h2><span>{product.codigo}</span></div>
          <button className="icon-button" type="button" aria-label="Cerrar" onClick={requestClose} disabled={saving}>×</button>
        </header>

        <form className="product-editor-form" onSubmit={(event) => void submit(event)}>
          <div className="product-editor-copy">
            <strong>Datos comerciales</strong>
            <p>Solo podés modificar el precio, el stock actual y la disponibilidad.</p>
          </div>

          <label>Precio por docena
            <span className="input-prefix"><span>$</span><input type="number" required min="0.01" step="any" inputMode="decimal" value={price} disabled={saving} onChange={(event) => { setPrice(event.target.value); setError(null) }} /></span>
          </label>

          <label>Stock disponible (docenas)
            <input type="number" required min="0" step="1" inputMode="numeric" value={stock} disabled={saving} onChange={(event) => { setStock(event.target.value); setError(null) }} />
          </label>

          <label className="switch-row product-editor-switch">
            <span><strong>Disponible para la venta</strong><small>{active ? 'El producto está disponible.' : 'El producto está pausado.'}</small></span>
            <input type="checkbox" checked={active} disabled={saving} onChange={(event) => toggleActive(event.target.checked)} />
            <span className="switch" />
          </label>

          {validationError && <p className="field-error" role="alert">{validationError}</p>}
          {error && <div className="form-alert" role="alert"><strong>No se guardaron los cambios.</strong><br />{error}</div>}

          <footer className="product-editor-actions">
            <button className="button button-secondary" type="button" onClick={requestClose} disabled={saving}>Cancelar</button>
            <button className="button button-primary" type="submit" disabled={saving || Boolean(validationError)}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
