import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { ADMIN_DENIED_MESSAGE, signInAdmin, signOut, verifyAdminSession } from '../services/authService'
import { supabase } from '../lib/supabase'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const verificationId = useRef(0)

  const applySession = useCallback(async (session: Session | null, showDeniedMessage = false) => {
    const currentVerification = ++verificationId.current
    if (!session) {
      setUser(null)
      setStatus('unauthenticated')
      return false
    }

    setStatus('loading')
    try {
      const isAdmin = await verifyAdminSession(session)
      if (currentVerification !== verificationId.current) return false
      if (!isAdmin) {
        setUser(null)
        setStatus('unauthenticated')
        if (showDeniedMessage) setError(ADMIN_DENIED_MESSAGE)
        await signOut()
        return false
      }
      setUser(session.user)
      setStatus('authenticated')
      return true
    } catch (sessionError) {
      if (currentVerification !== verificationId.current) return false
      setUser(null)
      setStatus('unauthenticated')
      setError(sessionError instanceof Error ? sessionError.message : 'No se pudo verificar la sesión')
      await signOut()
      return false
    }
  }, [])

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) {
        setError('No se pudo recuperar la sesión')
        setStatus('unauthenticated')
        return
      }
      void applySession(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'SIGNED_OUT' || !session) {
        verificationId.current += 1
        setUser(null)
        setStatus('unauthenticated')
        return
      }
      window.setTimeout(() => {
        if (active) void applySession(session, event === 'SIGNED_IN')
      }, 0)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [applySession])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setStatus('loading')
    try {
      const session = await signInAdmin(email, password)
      await applySession(session, true)
    } catch (loginError) {
      setUser(null)
      setStatus('unauthenticated')
      setError(loginError instanceof Error ? loginError.message : 'No se pudo iniciar sesión')
      throw loginError
    }
  }, [applySession])

  const logout = useCallback(async () => {
    verificationId.current += 1
    setUser(null)
    setStatus('unauthenticated')
    setError(null)
    await signOut()
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ status, user, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
