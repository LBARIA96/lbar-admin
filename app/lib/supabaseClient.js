// Cliente de Supabase para el navegador (client-side).
// Las credenciales se leen de variables de entorno publicas (NEXT_PUBLIC_*).
// Configura estas variables en Vercel y en un archivo .env.local para desarrollo.
import { createClient } from '@supabase/supabase-js';

// Fallbacks seguros para que el build no falle si las variables no estan
// disponibles en tiempo de compilacion. En runtime se usan las reales.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
