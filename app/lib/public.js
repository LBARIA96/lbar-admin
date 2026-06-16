import { supabase } from './supabaseClient';

// ---- Public booking helpers (anon access) ----

export async function getBusinessBySlug(slug) {
  const { data, error } = await supabase
    .from('business')
    .select('id, name, slug, currency, timezone, requires_confirmation, phone, whatsapp_phone, slot_interval_minutes')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublicServices(businessId) {
  const { data, error } = await supabase
    .from('service')
    .select('id, name, description, duration_minutes, price')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getPublicStaff(businessId) {
  const { data, error } = await supabase
    .from('staff')
    .select('id, name')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getAvailabilityRules(businessId, staffId) {
  let q = supabase
    .from('availability_rule')
    .select('id, staff_id, weekday, start_time, end_time')
    .eq('business_id', businessId);
  if (staffId) q = q.eq('staff_id', staffId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getAppointmentsForDay(businessId, staffId, dayStart, dayEnd) {
  let q = supabase
    .from('appointment')
    .select('id, staff_id, starts_at, ends_at, status')
    .eq('business_id', businessId)
    .gte('starts_at', dayStart)
    .lt('starts_at', dayEnd)
    .neq('status', 'cancelled');
  if (staffId) q = q.eq('staff_id', staffId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

// Build list of available "HH:MM" start times for a given date.
// rules: availability_rule rows for the chosen staff (filtered by weekday here)
// busy: existing appointments [{starts_at, ends_at}]
export function buildSlots(dateStr, rules, busy, durationMin, intervalMin) {
  const slots = [];
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.getDay(); // 0=Sun..6=Sat
  const todays = rules.filter(r => Number(r.weekday) === weekday);
  const step = intervalMin || 30;
  const dur = durationMin || step;
  const busyRanges = busy.map(b => [new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()]);
  const now = Date.now();
  for (const r of todays) {
    const [sh, sm] = String(r.start_time).split(':').map(Number);
    const [eh, em] = String(r.end_time).split(':').map(Number);
    let cur = new Date(dateStr + 'T00:00:00');
    cur.setHours(sh, sm, 0, 0);
    const end = new Date(dateStr + 'T00:00:00');
    end.setHours(eh, em, 0, 0);
    while (cur.getTime() + dur * 60000 <= end.getTime()) {
      const slotStart = cur.getTime();
      const slotEnd = slotStart + dur * 60000;
      const overlap = busyRanges.some(([bs, be]) => slotStart < be && slotEnd > bs);
      if (!overlap && slotStart > now) {
        const hh = String(cur.getHours()).padStart(2, '0');
        const mm = String(cur.getMinutes()).padStart(2, '0');
        slots.push(hh + ':' + mm);
      }
      cur = new Date(slotStart + step * 60000);
    }
  }
  return Array.from(new Set(slots)).sort();
}

export async function createPublicBooking({ businessId, serviceId, staffId, startsAt, endsAt, price, customer }) {
  // 1) create customer
  const { data: cust, error: cErr } = await supabase
    .from('customer')
    .insert({
      business_id: businessId,
      name: customer.name,
      phone: customer.phone || null,
      email: customer.email || null,
      notes: customer.notes || null,
    })
    .select('id')
    .single();
  if (cErr) throw cErr;
  // 2) create appointment (pending)
  const { data: appt, error: aErr } = await supabase
    .from('appointment')
    .insert({
      business_id: businessId,
      service_id: serviceId,
      staff_id: staffId,
      customer_id: cust.id,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'pending',
      price: price ?? null,
      customer_note: customer.notes || null,
    })
    .select('id')
    .single();
  if (aErr) throw aErr;
  return appt;
}

export const WEEKDAYS_ES = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

export function moneyFmt(currency, amount) {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: currency || 'ARS', maximumFractionDigits: 0 }).format(n);
  } catch {
    return '$' + n;
  }
}
