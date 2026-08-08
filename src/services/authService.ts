import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const ADMIN_DENIED_MESSAGE = 'Tu cuenta no tiene permisos de administrador'

export async function verifyAdminSession(session: Session | null): Promise<boolean> {
  if (!session) return false

  const { data, error } = await supabase.rpc('es_admin')
  if (error) throw new Error('No se pudo verificar el permiso de administrador')
  return data === true
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  try {
    const isAdmin = await verifyAdminSession(data.session)
    if (isAdmin) return data.session

    throw new Error(ADMIN_DENIED_MESSAGE)
  } catch (verificationError) {
    // Una sesión recién autenticada nunca debe persistir si la verificación
    // administrativa falla o no puede completarse.
    await supabase.auth.signOut()
    throw verificationError
  }
}

export const signOut = () => supabase.auth.signOut()
