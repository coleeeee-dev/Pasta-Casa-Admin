import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/pedidos', label: 'Pedidos', icon: 'P' },
  { to: '/productos', label: 'Productos', icon: 'R' },
]

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Navegación principal">
        <div className="sidebar-brand">
          <div className="brand-mark">PC</div>
          <div><strong>Pasta Casa</strong><span>Administración</span></div>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-icon" aria-hidden="true">{link.icon}</span>{link.label}
            </NavLink>
          ))}
        </nav>
        <button className="nav-link logout-link" onClick={handleLogout}>
          <span className="nav-icon" aria-hidden="true">↪</span>Cerrar sesión
        </button>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        <header className="topbar">
          <button className="menu-button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <span /><span /><span />
          </button>
          <div><p className="eyebrow">Panel de gestión</p><h1>Pasta Casa Admin</h1></div>
          <div className="admin-account"><span className="account-avatar" aria-hidden="true">A</span><span>{user?.email}</span></div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}
