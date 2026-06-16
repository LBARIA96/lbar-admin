import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '../../../lib/email';

export const dynamic = 'force-dynamic';

// Cliente con service role: corre en el servidor, sin restricciones de RLS.
function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function fmtFecha(iso, tz) {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      timeZone: tz || 'America/Argentina/Buenos_Aires',
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
    });
  } catch (e) {
    return new Date(iso).toISOString();
  }
}

function buildHtml({ negocio, cliente, servicio, cuando }) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
    <h2 style="color:#0f766e">Recordatorio de turno</h2>
    <p>Hola ${cliente || ''}, te recordamos tu turno en <strong>${negocio || 'nuestro negocio'}</strong>.</p>
    <table style="margin:16px 0;font-size:15px">
      <tr><td style="padding:4px 8px;color:#666">Servicio</td><td style="padding:4px 8px"><strong>${servicio || '-'}</strong></td></tr>
      <tr><td style="padding:4px 8px;color:#666">Fecha y hora</td><td style="padding:4px 8px"><strong>${cuando}</strong></td></tr>
    </table>
    <p style="color:#666;font-size:13px">Si no podes asistir, comunicate con el negocio para reprogramar. Gracias.</p>
  </div>`;
}

async function run(req) {
  // Proteccion: solo se ejecuta con el secreto correcto (Vercel Cron lo envia).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') || '';
    const url = new URL(req.url);
    const qs = url.searchParams.get('secret');
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const db = admin();
  if (!db) {
    return NextResponse.json({ error: 'faltan-env-supabase' }, { status: 500 });
  }

  const nowIso = new Date().toISOString();

  // Recordatorios programados cuya hora ya llego.
  const { data: pendientes, error: errP } = await db
    .from('reminder')
    .select('id, appointment_id, channel, attempts')
    .eq('status', 'scheduled')
    .lte('scheduled_for', nowIso)
    .limit(50);

  if (errP) {
    return NextResponse.json({ error: errP.message }, { status: 500 });
  }
  if (!pendientes || pendientes.length === 0) {
    return NextResponse.json({ ok: true, procesados: 0 });
  }

  let enviados = 0, fallidos = 0;

  for (const r of pendientes) {
    try {
      // Traemos los datos del turno con sus relaciones.
      const { data: ap } = await db
        .from('appointment')
        .select('id, starts_at, status, business(name, timezone), service(name), customer(name, email)')
        .eq('id', r.appointment_id)
        .maybeSingle();

      // Si el turno fue cancelado o no existe, cancelamos el recordatorio.
      if (!ap || ap.status === 'cancelled') {
        await db.from('reminder').update({ status: 'cancelled' }).eq('id', r.id);
        continue;
      }

      const to = ap.customer?.email;
      if (r.channel === 'email' && !to) {
        await db.from('reminder').update({
          status: 'failed', error: 'cliente-sin-email',
          attempts: (r.attempts || 0) + 1,
        }).eq('id', r.id);
        fallidos++;
        continue;
      }

      const cuando = fmtFecha(ap.starts_at, ap.business?.timezone);
      const html = buildHtml({
        negocio: ap.business?.name,
        cliente: ap.customer?.name,
        servicio: ap.service?.name,
        cuando,
      });

      const result = await sendEmail({
        to,
        subject: `Recordatorio: tu turno en ${ap.business?.name || 'el negocio'}`,
        html,
      });

      if (result.ok || result.skipped) {
        await db.from('reminder').update({
          status: result.ok ? 'sent' : 'scheduled',
          sent_at: result.ok ? new Date().toISOString() : null,
          error: result.skipped ? (result.reason || 'simulado') : null,
          attempts: (r.attempts || 0) + 1,
        }).eq('id', r.id);
        if (result.ok) enviados++;
      } else {
        await db.from('reminder').update({
          status: 'failed', error: String(result.error).slice(0, 300),
          attempts: (r.attempts || 0) + 1,
        }).eq('id', r.id);
        fallidos++;
      }
    } catch (err) {
      await db.from('reminder').update({
        status: 'failed', error: String(err).slice(0, 300),
        attempts: (r.attempts || 0) + 1,
      }).eq('id', r.id);
      fallidos++;
    }
  }

  return NextResponse.json({ ok: true, procesados: pendientes.length, enviados, fallidos });
}

export async function GET(req) { return run(req); }
export async function POST(req) { return run(req); }
