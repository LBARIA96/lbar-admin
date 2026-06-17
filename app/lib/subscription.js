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
    limits: { staff: 1, services: 5 },
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 9999,
    description: 'Para negocios en crecimiento.',
    features: ['Hasta 5 profesionales', 'Recordatorios por WhatsApp', 'Confirmacion automatica', 'Soporte prioritario'],
    limits: { staff: 5, services: 9999 },
  },
  {
    tier: 'business',
    name: 'Business',
    price: 24999,
    description: 'Para varios locales y equipos grandes.',
    features: ['Profesionales ilimitados', 'Multiples sucursales', 'Reportes avanzados', 'Soporte dedicado'],
    limits: { staff: 9999, services: 9999 },
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

// Inicia el checkout de pago para un plan pago.
// Llama a la ruta /api/mp/checkout (que usa MP_ACCESS_TOKEN del servidor)
// y devuelve la URL de pago de Mercado Pago. Si MP no esta configurado,
// devuelve { configured: false } para que la UI haga el fallback de demo.
export async function startCheckout(subscription, plan, email) {
  const res = await fetch('/api/mp/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier: plan.tier,
      price: plan.price,
      subscriptionId: subscription.id,
      businessId: subscription.business_id,
      email: email || null,
    }),
  });
  if (res.status === 500) {
    // Falta MP_ACCESS_TOKEN: todavia no esta conectada la pasarela.
    return { configured: false };
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'No se pudo iniciar el pago.');
  }
  return { configured: true, url: data.init_point };
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

// ---------- LIMITES DE PLAN ----------
const DEFAULT_LIMITS = { staff: 1, services: 5 };

// Devuelve los limites del plan segun el tier ('free' | 'pro' | 'business').
export function getPlanLimits(tier) {
  const plan = PLANS.find((p) => p.tier === tier);
  return (plan && plan.limits) ? plan.limits : DEFAULT_LIMITS;
}

// Devuelve el tier de la suscripcion del negocio actual.
// Si no esta activa o en prueba, cae a 'free'.
export async function getMyTier() {
  const sub = await getMySubscription();
  if (!sub) return 'free';
  const activo = sub.status === 'active' || sub.status === 'trialing';
  return activo ? (sub.tier || 'free') : 'free';
}
