const authMocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: authMocks.signInWithPassword,
      signOut: authMocks.signOut,
    },
    rpc: authMocks.rpc,
  },
}))

import { ADMIN_DENIED_MESSAGE, signInAdmin } from './authService'

describe('signInAdmin', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rechaza y cierra la sesión de un usuario autenticado que no es admin', async () => {
    authMocks.signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null })
    authMocks.rpc.mockResolvedValue({ data: false, error: null })
    authMocks.signOut.mockResolvedValue({ error: null })

    await expect(signInAdmin('usuario@test.invalid', 'clave-ficticia')).rejects.toThrow(ADMIN_DENIED_MESSAGE)
    expect(authMocks.rpc).toHaveBeenCalledWith('es_admin')
    expect(authMocks.signOut).toHaveBeenCalledOnce()
  })

  it('cierra la sesión si no puede verificar el permiso administrativo', async () => {
    authMocks.signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null })
    authMocks.rpc.mockResolvedValue({ data: null, error: { message: 'rpc error' } })
    authMocks.signOut.mockResolvedValue({ error: null })

    await expect(signInAdmin('usuario@test.invalid', 'clave-ficticia')).rejects.toThrow('verificar')
    expect(authMocks.signOut).toHaveBeenCalledOnce()
  })
})
