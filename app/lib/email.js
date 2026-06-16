// Envio de emails via Resend.
// Carga la variable RESEND_API_KEY en Vercel. Si no esta, no rompe: loguea y simula.
// Doc: https://resend.com/docs

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Remitente: idealmente un dominio propio verificado en Resend.
// Mientras tanto, Resend permite usar onboarding@resend.dev para pruebas.
const FROM_EMAIL = process.env.REMINDER_FROM_EMAIL || 'LBAR Reservas <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }) {
  if (!to) return { ok: false, skipped: true, reason: 'no-recipient' };

  if (!RESEND_API_KEY) {
    console.warn('sendEmail: falta RESEND_API_KEY, email simulado (no enviado) ->', to, subject);
    return { ok: false, skipped: true, reason: 'no-api-key' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error('sendEmail: Resend respondio error', res.status, txt);
      return { ok: false, error: `resend-${res.status}: ${txt}` };
    }

    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (err) {
    console.error('sendEmail: excepcion', err);
    return { ok: false, error: String(err) };
  }
}
