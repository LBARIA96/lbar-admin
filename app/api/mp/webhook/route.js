import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Webhook de Mercado Pago. MP llama aca cuando cambia el estado de un pago.
//
// IMPORTANTE (lo carga el dueno como Environment Variables en Vercel):
//   MP_ACCESS_TOKEN                -> Access Token de Mercado Pago
//   NEXT_PUBLIC_SUPABASE_URL       -> URL del proyecto Supabase
//   SUPABASE_SERVICE_ROLE_KEY      -> Service Role Key (SOLO en el servidor, nunca en el cliente)
//
// La Service Role salta RLS, por eso solo se usa del lado servidor en este webhook.
export async function POST(req) {
  const token = process.env.MP_ACCESS_TOKEN;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!token || !supaUrl || !serviceKey) {
    // Devolvemos 200 para que MP no reintente en loop mientras falta config.
    return NextResponse.json({ ok: false, reason: 'config-missing' });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  // MP puede notificar por query (?type=payment&data.id=123) o por body.
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || (body && body.type);
  const paymentId =
    url.searchParams.get('data.id') ||
    (body && body.data && body.data.id);

  if (type !== 'payment' || !paymentId) {
    // Otros eventos (merchant_order, etc) los ignoramos por ahora.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // 1) Consultar el pago real en MP (nunca confiar solo en la notificacion).
  const payRes = await fetch('https://api.mercadopago.com/v1/payments/' + paymentId, {
    headers: { Authorization: 'Bearer ' + token },
  });
  const payment = await payRes.json();
  if (!payRes.ok) {
    return NextResponse.json({ ok: false, reason: 'payment-fetch-failed' });
  }

  // 2) Recuperar la referencia que mandamos al crear la preferencia.
  let ref = {};
  try {
    ref = JSON.parse(payment.external_reference || '{}');
  } catch {
    ref = {};
  }
  const { subscriptionId, tier } = ref;
  if (!subscriptionId) {
    return NextResponse.json({ ok: true, noRef: true });
  }

  // 3) Mapear el estado del pago al estado de la suscripcion.
  let status = null;
  if (payment.status === 'approved') status = 'active';
  else if (payment.status === 'pending' || payment.status === 'in_process') status = 'trialing';
  else if (payment.status === 'rejected' || payment.status === 'cancelled') status = 'past_due';

  if (!status) {
    return NextResponse.json({ ok: true, status: payment.status });
  }

  // 4) Actualizar la suscripcion con la Service Role (salta RLS).
  const admin = createClient(supaUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const patch = {
    status,
    provider: 'mercadopago',
    provider_ref: String(paymentId),
  };
  if (tier) patch.tier = tier;
  if (status === 'active') {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    patch.current_period_end = end.toISOString();
  }

  const { error } = await admin
    .from('subscription')
    .update(patch)
    .eq('id', subscriptionId);
  if (error) {
    return NextResponse.json({ ok: false, reason: error.message });
  }

  return NextResponse.json({ ok: true, status });
}
