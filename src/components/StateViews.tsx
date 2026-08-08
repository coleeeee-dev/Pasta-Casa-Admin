export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function FullPageLoader({ label }: { label: string }) {
  return (
    <main className="full-page-state">
      <div className="brand-mark" aria-hidden="true">PC</div>
      <Spinner label={label} />
    </main>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="message-state error-state" role="alert">
      <span className="message-icon" aria-hidden="true">!</span>
      <div>
        <strong>No pudimos completar la operación</strong>
        <p>{message}</p>
      </div>
      {onRetry && <button className="button button-secondary" onClick={onRetry}>Reintentar</button>}
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="message-state empty-state">
      <span className="message-icon" aria-hidden="true">—</span>
      <div><strong>{title}</strong><p>{description}</p></div>
    </div>
  )
}
