import { supabase } from './supabaseClient';

// Cuantas horas antes del turno se envia el recordatorio.
const HOURS_BEFORE = 24;

// Programa un recordatorio por email para un turno.
// Inserta una fila en la tabla 'reminder' con status 'scheduled'.
// No rompe el flujo si falla: loguea el error y sigue.
export async function scheduleReminder({ appointmentId, businessId, startsAt, channel = 'email' }) {
  try {
    if (!appointmentId || !businessId || !startsAt) {
      return { ok: false, reason: 'missing-data' };
    }

    const start = new Date(startsAt);
    const scheduledFor = new Date(start.getTime() - HOURS_BEFORE * 60 * 60 * 1000);

    // Si el turno es en menos de HOURS_BEFORE horas, programamos el envio para ya.
    const now = new Date();
    const when = scheduledFor < now ? now : scheduledFor;

    const { data, error } = await supabase.from('reminder').insert({
      business_id: businessId,
      appointment_id: appointmentId,
      channel,
      scheduled_for: when.toISOString(),
      status: 'scheduled',
    }).select().maybeSingle();

    if (error) {
      console.error('scheduleReminder', error);
      return { ok: false, error };
    }
    return { ok: true, data };
  } catch (err) {
    console.error('scheduleReminder exception', err);
    return { ok: false, error: String(err) };
  }
}
