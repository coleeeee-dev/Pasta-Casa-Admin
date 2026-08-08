import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Los valores de reserva solo evitan que la interfaz falle antes de mostrar
// el aviso de configuración. Nunca permiten acceder a un proyecto real.
export const supabase = createClient(
  supabaseUrl || 'http://127.0.0.1:54321',
  supabaseAnonKey || 'publishable-key-not-configured',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
