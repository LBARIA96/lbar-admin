import { supabase } from './supabaseClient';
import { getMyBusiness } from './queries';

// Definicion de planes (precios en ARS por mes).
// Ajusta los precios y limites segun tu modelo de negocio.
export const PLANS = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    description: 'Para empezar a recibir turnos online.',
    features: ['1 profesional', 'Turnos ilimitados', 'Pagina publica de reservas'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 9999,
    description: 'Para negocios en crecimiento.',
    features: ['Hasta 5 profesionales', 'Recordatorios por WhatsApp', 'Confirmacion automatica', 'Soporte prioritario'],
  },
  {
    tier: 'business',
    name: 'Business',
    price: 24999,
    description: 'Para varios locales y equipos grandes.',
    features: ['Profesionales ilimitados', 'Multiples sucursales', 'Reportes avanzados', 'Soporte dedicado'],
  },
];

export const STATUS_LABELS = {
  trialing: 'Periodo de prueba',
  active: 'Activa',
  past_due: 'Pago pendiente',
  cancelled: 'Cancelada',
};

// Devuelve la suscripcion del negocio del usuario. Si no existe, crea una Free.
export async function getMySubscription() {
  const biz = await getMyBusiness();
  if (!biz) return { business: null, subscription: null };

  const { data: existing, error } = await supabase
    .from('subscription')
    .select('id, tier, status, provider, provider_ref, current_period_end, created_at')
    .eq('business_id', biz.id)
    .maybeSingle();
  if (error) throw error;

  if (existing) return { business: biz, subscription: existing };

  // Crear suscripcion Free por defecto
  const { data: created, error: insErr } = await supabase
    .from('subscription')
    .insert({ business_id: biz.id, tier: 'free', status: 'active' })
    .select('id, tier, status, provider, provider_ref, current_period_end, created_at')
    .single();
  if (insErr) throw insErr;
  return { business: biz, subscription: created };
}

// Cambia el plan elegido. Para el plan Free se aplica directo.
// Para planes pagos, aca es donde despues se conecta el checkout real
// (Mercado Pago / Stripe). Por ahora deja la suscripcion como 'trialing'.
export async function selectPlan(subscriptionId, tier) {
  const status = tier === 'free' ? 'active' : 'trialing';
  const { data, error } = await supabase
    .from('subscription')
    .update({ tier, status })
    .eq('id', subscriptionId)
    .select('id, tier, status, provider, provider_ref, current_period_end, created_at')
    .single();
  if (error) throw error;
  return data;
}

export function planMoney(amount) {
  const n = Number(amount || 0);
  if (n === 0) return 'Gratis';
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n) + ' /mes';
  } catch {
    return '$' + n + ' /mes';
  }
}
