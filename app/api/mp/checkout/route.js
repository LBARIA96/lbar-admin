import { NextResponse } from 'next/server';

// Crea una preferencia de pago en Mercado Pago y devuelve el link de checkout.
//
// IMPORTANTE (lo carga el dueno, no va en el codigo):
//   MP_ACCESS_TOKEN      -> Access Token de Mercado Pago (Credenciales de produccion)
//   NEXT_PUBLIC_BASE_URL -> URL publica del sitio, ej: https://lbar-admin.vercel.app
// Ambas se configuran como Environment Variables en Vercel.
//
// Body esperado: { tier, price, subscriptionId, businessId, email }
export async function POST(req) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno.' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body invalido' }, { status: 400 });
  }

  const { tier, price, subscriptionId, businessId, email } = body || {};
  if (!tier || !price || !subscriptionId) {
    return NextResponse.json({ error: 'Faltan datos del plan' }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

  const preference = {
    items: [
      {
        title: 'Plan ' + tier + ' - LBAR Reservas',
        quantity: 1,
        unit_price: Number(price),
        currency_id: 'ARS',
      },
    ],
    payer: email ? { email } : undefined,
    // Referencia para identificar la suscripcion al recibir el webhook.
    external_reference: JSON.stringify({ subscriptionId, businessId, tier }),
    back_urls: {
      success: base + '/suscripcion?status=success',
      pending: base + '/suscripcion?status=pending',
      failure: base + '/suscripcion?status=failure',
    },
    auto_return: 'approved',
    notification_url: base + '/api/mp/webhook',
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(preference),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Error de Mercado Pago', detail: data },
      { status: 502 }
    );
  }

  // init_point: checkout de produccion. sandbox_init_point: pruebas.
  return NextResponse.json({
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  });
}
