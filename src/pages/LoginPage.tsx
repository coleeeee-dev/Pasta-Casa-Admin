import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabaseConfigured } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { status, error, login, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from || '/dashboard'

  useEffect(() => clearError, [clearError])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password || !supabaseConfigured) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(destination, { replace: true })
    } catch {
      // AuthContext expone un mensaje seguro y comprensible.
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'authenticated') return <Navigate to={destination} replace />

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand"><div className="brand-mark">PC</div><span>Pasta Casa</span></div>
        <div className="login-copy">
          <p className="eyebrow">Acceso restringido</p>
          <h1>Panel administrativo</h1>
          <p>Ingresá con tu cuenta autorizada para gestionar pedidos y productos.</p>
        </div>

        {!supabaseConfigured && (
          <div className="form-alert" role="alert">Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local antes de ingresar.</div>
        )}
        {error && <div className="form-alert" role="alert">{error}</div>}

        <form onSubmit={submit} className="login-form">
          <label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => { clearError(); setEmail(event.target.value) }} placeholder="admin@pasta-casa.invalid" required /></label>
          <label>Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => { clearError(); setPassword(event.target.value) }} placeholder="Tu contraseña" required /></label>
          <button className="button button-primary button-large" disabled={submitting || status === 'loading' || !supabaseConfigured}>
            {submitting || status === 'loading' ? 'Verificando acceso…' : 'Ingresar'}
          </button>
        </form>
        <p className="security-note"><span aria-hidden="true">●</span> Acceso protegido por Supabase Auth y Row Level Security</p>
      </section>
      <aside className="login-visual" aria-hidden="true">
        <div className="visual-grid" />
        <div className="visual-card"><span>Gestión segura</span><strong>Todo tu negocio,<br />en un solo lugar.</strong><p>Pedidos, cobros y stock con acceso exclusivo para administradores.</p></div>
      </aside>
    </main>
  )
}
