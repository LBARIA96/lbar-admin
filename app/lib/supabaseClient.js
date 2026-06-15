// Cliente de Supabase para el navegador (client-side).
// Las credenciales se leen de variables de entorno publicas (NEXT_PUBLIC_*).
// Configura estas variables en Vercel y en un archivo .env.local para desarrollo.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso util en desarrollo si faltan las variables.
    console.warn('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
          persistSession: true,
              autoRefreshToken: true,
                },
                });
                
