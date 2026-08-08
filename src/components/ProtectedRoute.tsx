import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullPageLoader } from './StateViews'

export function ProtectedRoute() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader label="Verificando acceso de administrador…" />
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
