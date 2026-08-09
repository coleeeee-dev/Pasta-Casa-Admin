import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ErrorState, Spinner } from '../components/StateViews'
import { useAsyncData } from '../hooks/useAsyncData'
import { getBusinessConfig, updateBusinessConfig } from '../services/configService'
import type { BusinessConfig, BusinessConfigChanges } from '../types/config'
import { hasConfigValidationErrors, validateBusinessConfig } from '../utils/config'
import { formatDate } from '../utils/formatters'

const DISCARD_MESSAGE = 'Tenés cambios sin guardar. ¿Querés descartarlos?'

interface ConfigFormProps {
  config: BusinessConfig
  onSaved: (config: BusinessConfig) => void
}

function ConfigForm({ config, onSaved }: ConfigFormProps) {
  const [businessName, setBusinessName] = useState(config.nombre_negocio)
  const [whatsapp, setWhatsapp] = useState(config.whatsapp)
  const [cbu, setCbu] = useState(config.cbu)
  const [taxId, setTaxId] = useState(config.identificacion_fiscal)
  const [owner, setOwner] = useState(config.titular)
  const [paymentHours, setPaymentHours] = useState(String(config.horas_limite_pago))
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const savingRef = useRef(false)

  const changes: BusinessConfigChanges = {
    nombre_negocio: businessName.trim(),
    whatsapp: whatsapp.trim(),
    cbu: cbu.trim(),
    identificacion_fiscal: taxId.trim(),
    titular: owner.trim(),
    horas_limite_pago: paymentHours.trim() === '' ? Number.NaN : Number(paymentHours),
  }
  const validationErrors = validateBusinessConfig(changes)
  const isDirty = businessName !== config.nombre_negocio
    || whatsapp !== config.whatsapp
    || cbu !== config.cbu
    || taxId !== config.identificacion_fiscal
    || owner !== config.titular
    || paymentHours !== String(config.horas_limite_pago)

  useEffect(() => {
    if (!isDirty) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const confirmNavigation = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest('a[href]')
      const logout = target.closest('button.logout-link')
      if (!link && !logout) return

      if (link) {
        const destination = new URL(link.getAttribute('href') ?? '', window.location.href)
        if (destination.pathname === window.location.pathname && destination.search === window.location.search) return
      }

      if (!window.confirm(DISCARD_MESSAGE)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    document.addEventListener('click', confirmNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload)
      document.removeEventListener('click', confirmNavigation, true)
    }
  }, [isDirty])

  const updateField = (setter: (value: string) => void, value: string) => {
    setter(value)
    setError(null)
    setSuccess(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)
    if (hasConfigValidationErrors(validationErrors) || savingRef.current) return

    savingRef.current = true
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await updateBusinessConfig(changes)
      setBusinessName(updated.nombre_negocio)
      setWhatsapp(updated.whatsapp)
      setCbu(updated.cbu)
      setTaxId(updated.identificacion_fiscal)
      setOwner(updated.titular)
      setPaymentHours(String(updated.horas_limite_pago))
      setSubmitted(false)
      onSaved(updated)
      setSuccess('Configuración actualizada correctamente')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo actualizar la configuración')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <form className="config-form" noValidate onSubmit={(event) => void submit(event)}>
      {success && <div className="success-banner page-success" role="status">{success}</div>}
      {error && <div className="form-alert config-form-error" role="alert"><strong>No se guardaron los cambios.</strong><br />{error}</div>}

      <div className="config-grid">
        <section className="config-card">
          <div className="config-card-heading"><span className="config-card-icon" aria-hidden="true">N</span><div><h3>Negocio</h3><p>Identidad pública principal.</p></div></div>
          <label className="config-field">Nombre del negocio
            <input type="text" required minLength={2} maxLength={80} value={businessName} disabled={saving} onChange={(event) => updateField(setBusinessName, event.target.value)} />
            {submitted && validationErrors.nombre_negocio && <small className="config-field-error">{validationErrors.nombre_negocio}</small>}
          </label>
        </section>

        <section className="config-card">
          <div className="config-card-heading"><span className="config-card-icon" aria-hidden="true">W</span><div><h3>Contacto</h3><p>Canal visible para clientes.</p></div></div>
          <label className="config-field">WhatsApp
            <input type="tel" required value={whatsapp} disabled={saving} placeholder="+54 9 3865 38-5579" onChange={(event) => updateField(setWhatsapp, event.target.value)} />
            {submitted && validationErrors.whatsapp && <small className="config-field-error">{validationErrors.whatsapp}</small>}
          </label>
        </section>

        <section className="config-card config-card-wide">
          <div className="config-card-heading"><span className="config-card-icon" aria-hidden="true">T</span><div><h3>Datos de transferencia</h3><p>Información pública utilizada para recibir pagos.</p></div></div>
          <div className="config-fields-grid">
            <label className="config-field">CBU
              <input type="text" required inputMode="numeric" maxLength={22} value={cbu} disabled={saving} onChange={(event) => { if (/^\d*$/.test(event.target.value)) updateField(setCbu, event.target.value) }} />
              {submitted && validationErrors.cbu && <small className="config-field-error">{validationErrors.cbu}</small>}
            </label>
            <label className="config-field">Identificación fiscal
              <input type="text" required value={taxId} disabled={saving} placeholder="20-42468452-0" onChange={(event) => updateField(setTaxId, event.target.value)} />
              {submitted && validationErrors.identificacion_fiscal && <small className="config-field-error">{validationErrors.identificacion_fiscal}</small>}
            </label>
            <label className="config-field config-field-wide">Titular de la cuenta
              <input type="text" required minLength={2} value={owner} disabled={saving} onChange={(event) => updateField(setOwner, event.target.value)} />
              {submitted && validationErrors.titular && <small className="config-field-error">{validationErrors.titular}</small>}
            </label>
          </div>
        </section>

        <section className="config-card config-card-wide">
          <div className="config-card-heading"><span className="config-card-icon" aria-hidden="true">H</span><div><h3>Pedidos por transferencia</h3><p>Plazo disponible para realizar el pago.</p></div></div>
          <label className="config-field config-hours-field">Tiempo máximo para realizar el pago
            <span className="config-hours-input"><input type="number" required min="1" max="72" step="1" value={paymentHours} disabled={saving} onChange={(event) => updateField(setPaymentHours, event.target.value)} /><span>horas</span></span>
            {submitted && validationErrors.horas_limite_pago && <small className="config-field-error">{validationErrors.horas_limite_pago}</small>}
            <small className="config-help">Después de este plazo, el pedido podrá ser cancelado manualmente desde el panel y el stock reservado será liberado.</small>
          </label>
        </section>
      </div>

      <footer className="config-actions">
        <div><span>Última actualización</span><strong>{formatDate(config.updated_at)}</strong></div>
        <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </footer>
    </form>
  )
}

export function ConfigPage() {
  const { data: config, setData: setConfig, loading, error, reload } = useAsyncData(getBusinessConfig, [])

  return (
    <div className="page-stack">
      <div className="page-heading"><div><p className="eyebrow">Datos públicos</p><h2>Configuración</h2><p>Administrá los datos públicos utilizados por la tienda.</p></div></div>
      <div className="info-banner public-config-banner"><span aria-hidden="true">i</span><p>Estos datos podrán mostrarse a los clientes en la tienda. Solo administradores autorizados pueden modificarlos.</p></div>

      {loading ? <Spinner label="Cargando configuración…" /> : error ? <ErrorState message={error} onRetry={reload} /> : config ? (
        <ConfigForm config={config} onSaved={setConfig} />
      ) : <ErrorState message="No se encontró la configuración administrativa con id = 1" onRetry={reload} />}
    </div>
  )
}
