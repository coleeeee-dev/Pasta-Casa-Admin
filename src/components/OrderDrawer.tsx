import { useEffect, useState } from 'react'
import { getOrderDetails, updateOrderStatus } from '../services/orderService'
import type { Order, OrderDetail, OrderStatus } from '../types/database'
import { formatCurrency, formatDate, formatPaymentMethod } from '../utils/formatters'
import { getAvailableOrderActions } from '../utils/orderTransitions'
import { createWhatsAppUrl } from '../utils/whatsapp'
import { ErrorState, Spinner } from './StateViews'
import { StatusBadge } from './StatusBadge'

interface OrderDrawerProps {
  order: Order
  onClose: () => void
  onUpdated: (order: Order) => void
}

const actionLabels: Partial<Record<OrderStatus, string>> = {
  esperando_validacion: 'Marcar esperando validación',
  pago_confirmado: 'Confirmar pago',
  completado: 'Marcar como completado',
  cancelado: 'Cancelar pedido',
}

export function OrderDrawer({ order, onClose, onUpdated }: OrderDrawerProps) {
  const [details, setDetails] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const availableActions = getAvailableOrderActions(order)
  const whatsAppUrl = createWhatsAppUrl(order.telefono, order.nombre, order.codigo)

  const loadDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      setDetails(await getOrderDetails(order.id))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el detalle')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDetails()
  }, [order.id])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  const changeStatus = async (nextStatus: OrderStatus) => {
    if (nextStatus !== 'esperando_validacion') {
      const confirmed = window.confirm(`¿Confirmás la acción “${actionLabels[nextStatus]}”?`)
      if (!confirmed) return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateOrderStatus(order.id, nextStatus)
      onUpdated(updated)
      setSuccess('El estado del pedido se actualizó correctamente.')
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el estado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="drawer-layer" role="presentation">
      <button className="drawer-backdrop" aria-label="Cerrar detalle" onClick={onClose} />
      <section className="order-drawer" role="dialog" aria-modal="true" aria-labelledby="order-drawer-title">
        <div className="drawer-header">
          <div><p className="eyebrow">Detalle de pedido</p><h2 id="order-drawer-title">{order.codigo}</h2></div>
          <button className="icon-button" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>

        <div className="drawer-content">
          {success && <div className="success-banner" role="status">{success}</div>}
          {error && <ErrorState message={error} onRetry={loading ? undefined : loadDetails} />}

          <section className="detail-section">
            <h3>Datos del pedido</h3>
            <dl className="detail-grid">
              <div><dt>Código</dt><dd>{order.codigo}</dd></div>
              <div><dt>Fecha</dt><dd>{formatDate(order.created_at)}</dd></div>
              <div><dt>Estado</dt><dd><StatusBadge status={order.estado} /></dd></div>
              <div><dt>Método de pago</dt><dd>{formatPaymentMethod(order.metodo_pago)}</dd></div>
              <div><dt>Total</dt><dd className="detail-total">{formatCurrency(Number(order.total))}</dd></div>
            </dl>
          </section>

          <section className="detail-section">
            <h3>Cliente</h3>
            <dl className="detail-grid">
              <div><dt>Nombre y apellido</dt><dd>{order.nombre} {order.apellido}</dd></div>
              <div><dt>Número de celular</dt><dd>{order.telefono?.trim() || 'Sin teléfono registrado'}</dd></div>
            </dl>
            <div className="client-contact">
              {whatsAppUrl ? (
                <a className="button whatsapp-button" href={whatsAppUrl} target="_blank" rel="noreferrer">Contactar por WhatsApp</a>
              ) : (
                <button className="button whatsapp-button-disabled" disabled>Contactar por WhatsApp</button>
              )}
            </div>
          </section>

          <section className="detail-section">
            <h3>Productos</h3>
            {loading ? <Spinner label="Cargando productos…" /> : details.length === 0 ? (
              <p className="muted">Este pedido no tiene productos registrados.</p>
            ) : (
              <div className="detail-products">
                {details.map((detail) => (
                  <article key={detail.id} className="detail-product">
                    <div><strong>{detail.nombre_producto}</strong><span>{detail.cantidad_docenas} docena{detail.cantidad_docenas === 1 ? '' : 's'}</span></div>
                    <div><span>{formatCurrency(Number(detail.precio_unitario))} / docena</span><strong>{formatCurrency(Number(detail.subtotal))}</strong></div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {availableActions.length > 0 && (
          <footer className="drawer-actions">
            {availableActions.map((status: OrderStatus) => (
              <button key={status} disabled={saving} className={`button ${status === 'cancelado' ? 'button-danger' : 'button-primary'}`} onClick={() => void changeStatus(status)}>
                {saving ? 'Guardando…' : actionLabels[status]}
              </button>
            ))}
          </footer>
        )}
      </section>
    </div>
  )
}
