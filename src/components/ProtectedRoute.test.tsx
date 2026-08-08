import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext, type AuthContextValue, type AuthStatus } from '../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

function renderProtected(status: AuthStatus) {
  const value: AuthContextValue = {
    status,
    user: null,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    clearError: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Página de acceso</div>} />
          <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<div>Contenido administrativo</div>} /></Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirige al login cuando no existe una sesión administrativa', () => {
    renderProtected('unauthenticated')
    expect(screen.getByText('Página de acceso')).toBeInTheDocument()
    expect(screen.queryByText('Contenido administrativo')).not.toBeInTheDocument()
  })

  it('no renderiza datos privados mientras verifica el permiso', () => {
    renderProtected('loading')
    expect(screen.getByText('Verificando acceso de administrador…')).toBeInTheDocument()
    expect(screen.queryByText('Contenido administrativo')).not.toBeInTheDocument()
  })

  it('permite el acceso a un administrador verificado', () => {
    renderProtected('authenticated')
    expect(screen.getByText('Contenido administrativo')).toBeInTheDocument()
  })
})
