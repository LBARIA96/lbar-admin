import { supabase } from './supabaseClient';
import { scheduleReminder } from './reminders';

// ---------- BUSINESS ----------
export async function getMyBusiness() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('business').select('*').eq('owner_id', user.id).maybeSingle();
  if (error) { console.error('getMyBusiness', error); return null; }
  return data;
}

export async function updateMyBusiness(patch) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const { data, error } = await supabase.from('business').update(patch).eq('id', biz.id).select().maybeSingle();
  return { data, error };
}

// ---------- SERVICES ----------
export async function getMyServices() {
  const biz = await getMyBusiness();
  if (!biz) return [];
  const { data, error } = await supabase.from('service').select('*').eq('business_id', biz.id).order('name');
  if (error) { console.error('getMyServices', error); return []; }
  return data;
}

export async function saveService(svc) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const row = {
    business_id: biz.id,
    name: svc.name,
    description: svc.description || null,
    duration_minutes: Number(svc.duration_minutes) || 30,
    price: Number(svc.price) || 0,
    is_active: svc.is_active !== false,
  };
  if (svc.id) {
    const { data, error } = await supabase.from('service').update(row).eq('id', svc.id).select().maybeSingle();
    return { data, error };
  }
  const { data, error } = await supabase.from('service').insert(row).select().maybeSingle();
  return { data, error };
}

export async function deleteService(id) {
  const { error } = await supabase.from('service').delete().eq('id', id);
  return { error };
}

// ---------- STAFF ----------
export async function getMyStaff() {
  const biz = await getMyBusiness();
  if (!biz) return [];
  const { data, error } = await supabase.from('staff').select('*').eq('business_id', biz.id).order('name');
  if (error) { console.error('getMyStaff', error); return []; }
  return data;
}

export async function saveStaff(s) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const row = {
    business_id: biz.id,
    name: s.name,
    email: s.email || null,
    is_active: s.is_active !== false,
  };
  if (s.id) {
    const { data, error } = await supabase.from('staff').update(row).eq('id', s.id).select().maybeSingle();
    return { data, error };
  }
  const { data, error } = await supabase.from('staff').insert(row).select().maybeSingle();
  return { data, error };
}

export async function deleteStaff(id) {
  const { error } = await supabase.from('staff').delete().eq('id', id);
  return { error };
}

// ---------- CUSTOMERS ----------
export async function getMyCustomers() {
  const biz = await getMyBusiness();
  if (!biz) return [];
  const { data, error } = await supabase.from('customer').select('*').eq('business_id', biz.id).order('name');
  if (error) { console.error('getMyCustomers', error); return []; }
  return data;
}

export async function saveCustomer(c) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const row = {
    business_id: biz.id,
    name: c.name,
    phone: c.phone || null,
    email: c.email || null,
    notes: c.notes || null,
  };
  if (c.id) {
    const { data, error } = await supabase.from('customer').update(row).eq('id', c.id).select().maybeSingle();
    return { data, error };
  }
  const { data, error } = await supabase.from('customer').insert(row).select().maybeSingle();
  return { data, error };
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customer').delete().eq('id', id);
  return { error };
}

// ---------- HORARIOS (availability_rule) ----------
export async function getMyAvailability() {
  const biz = await getMyBusiness();
  if (!biz) return [];
  const { data, error } = await supabase.from('availability_rule').select('*, staff(name)').eq('business_id', biz.id).order('weekday');
  if (error) { console.error('getMyAvailability', error); return []; }
  return data;
}

export async function saveAvailability(r) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const row = {
    business_id: biz.id,
    staff_id: r.staff_id,
    weekday: Number(r.weekday),
    start_time: r.start_time,
    end_time: r.end_time,
  };
  if (r.id) {
    const { data, error } = await supabase.from('availability_rule').update(row).eq('id', r.id).select().maybeSingle();
    return { data, error };
  }
  const { data, error } = await supabase.from('availability_rule').insert(row).select().maybeSingle();
  return { data, error };
}

export async function deleteAvailability(id) {
  const { error } = await supabase.from('availability_rule').delete().eq('id', id);
  return { error };
}

// ---------- RESERVAS (appointment) ----------
export async function getMyAppointments() {
  const biz = await getMyBusiness();
  if (!biz) return [];
  const { data, error } = await supabase
    .from('appointment')
    .select('*, service(name), staff(name), customer(name, phone)')
    .eq('business_id', biz.id)
    .order('starts_at', { ascending: false });
  if (error) { console.error('getMyAppointments', error); return []; }
  return data;
}

export async function updateAppointmentStatus(id, status) {
  const { data, error } = await supabase.from('appointment').update({ status }).eq('id', id).select().maybeSingle();
  return { data, error };
}

export async function createAppointment(a) {
  const biz = await getMyBusiness();
  if (!biz) return { error: 'no-business' };
  const row = {
    business_id: biz.id,
    staff_id: a.staff_id,
    service_id: a.service_id,
    customer_id: a.customer_id,
    starts_at: a.starts_at,
    ends_at: a.ends_at,
    status: a.status || 'confirmed',
    price: a.price != null ? Number(a.price) : null,
    customer_note: a.customer_note || null,
  };
  const { data, error } = await supabase.from('appointment').insert(row).select().maybeSingle();
    if (data && !error) {
    await scheduleReminder({ appointmentId: data.id, businessId: biz.id, startsAt: data.starts_at });
  }
  return { data, error };
}

// ---------- DASHBOARD ----------
export async function getDashboardStats() {
  const biz = await getMyBusiness();
  if (!biz) return { services: 0, staff: 0, customers: 0, appointments: 0, upcoming: [] };
  const [svc, stf, cus, app] = await Promise.all([
    supabase.from('service').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
    supabase.from('staff').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
    supabase.from('customer').select('id', { count: 'exact', head: true }).eq('business_id', biz.id),
    supabase.from('appointment').select('*, service(name), customer(name)').eq('business_id', biz.id).gte('starts_at', new Date().toISOString()).order('starts_at').limit(5),
  ]);
  return {
    services: svc.count || 0,
    staff: stf.count || 0,
    customers: cus.count || 0,
    appointments: (app.data || []).length,
    upcoming: app.data || [],
  };
}

// ---------- HELPERS ----------
export function money(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value || 0);
}

export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
