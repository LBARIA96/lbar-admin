// Datos de ejemplo (mock) que reflejan el esquema real de Supabase.
// Cuando se conecte el backend, estas funciones se reemplazan por consultas.

export const business = {
  id: 'b1',
  name: 'Spa Relax Belgrano',
  slug: 'spa-relax-belgrano',
  timezone: 'America/Argentina/Buenos_Aires',
  currency: 'ARS',
  phone: '+54 11 4555-1234',
  whatsapp_phone: '+54 9 11 4555-1234',
  requires_confirmation: true,
  requires_deposit: true,
  deposit_amount: 5000,
  cancellation_window_hours: 24,
};

export const staff = [
  { id: 's1', name: 'Carla Gomez', role: 'Masajista', active: true },
  { id: 's2', name: 'Diego Funes', role: 'Esteticista', active: true },
  { id: 's3', name: 'Lucia Pereyra', role: 'Masajista', active: false },
];

export const services = [
  { id: 'sv1', name: 'Masaje descontracturante', description: 'Masaje profundo de espalda y cuello', duration_min: 60, price: 18000, active: true },
  { id: 'sv2', name: 'Masaje relajante', description: 'Masaje corporal completo', duration_min: 90, price: 24000, active: true },
  { id: 'sv3', name: 'Limpieza facial', description: 'Limpieza profunda + hidratacion', duration_min: 45, price: 15000, active: true },
  { id: 'sv4', name: 'Drenaje linfatico', description: 'Tecnica de drenaje manual', duration_min: 60, price: 20000, active: false },
];

export const customers = [
  { id: 'c1', name: 'Maria Lopez', phone: '+54 11 6111-2233', email: 'maria.lopez@mail.com', notes: 'Prefiere turnos por la manana' },
  { id: 'c2', name: 'Juan Perez', phone: '+54 11 6222-3344', email: 'juanp@mail.com', notes: '' },
  { id: 'c3', name: 'Sofia Ramirez', phone: '+54 11 6333-4455', email: 'sofiar@mail.com', notes: 'Alergica a aceites citricos' },
  { id: 'c4', name: 'Nicolas Diaz', phone: '+54 11 6444-5566', email: 'nico.diaz@mail.com', notes: '' },
];

const today = new Date();
function at(dayOffset, h, m) {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const appointments = [
  { id: 'a1', customer_id: 'c1', staff_id: 's1', service_id: 'sv1', starts_at: at(0, 9, 0), ends_at: at(0, 10, 0), status: 'confirmed', price: 18000, deposit_paid: true },
  { id: 'a2', customer_id: 'c2', staff_id: 's2', service_id: 'sv3', starts_at: at(0, 11, 0), ends_at: at(0, 11, 45), status: 'pending', price: 15000, deposit_paid: false },
  { id: 'a3', customer_id: 'c3', staff_id: 's1', service_id: 'sv2', starts_at: at(0, 13, 0), ends_at: at(0, 14, 30), status: 'confirmed', price: 24000, deposit_paid: true },
  { id: 'a4', customer_id: 'c4', staff_id: 's2', service_id: 'sv1', starts_at: at(1, 10, 0), ends_at: at(1, 11, 0), status: 'pending', price: 18000, deposit_paid: false },
  { id: 'a5', customer_id: 'c1', staff_id: 's1', service_id: 'sv3', starts_at: at(1, 15, 0), ends_at: at(1, 15, 45), status: 'cancelled', price: 15000, deposit_paid: false },
  { id: 'a6', customer_id: 'c2', staff_id: 's2', service_id: 'sv2', starts_at: at(2, 9, 30), ends_at: at(2, 11, 0), status: 'confirmed', price: 24000, deposit_paid: true },
  { id: 'a7', customer_id: 'c3', staff_id: 's1', service_id: 'sv1', starts_at: at(-1, 16, 0), ends_at: at(-1, 17, 0), status: 'completed', price: 18000, deposit_paid: true },
];

export const availabilityRules = [
  { id: 'r1', staff_id: 's1', weekday: 1, start_time: '09:00', end_time: '18:00' },
  { id: 'r2', staff_id: 's1', weekday: 2, start_time: '09:00', end_time: '18:00' },
  { id: 'r3', staff_id: 's1', weekday: 3, start_time: '09:00', end_time: '13:00' },
  { id: 'r4', staff_id: 's2', weekday: 1, start_time: '10:00', end_time: '19:00' },
  { id: 'r5', staff_id: 's2', weekday: 4, start_time: '10:00', end_time: '19:00' },
  { id: 'r6', staff_id: 's2', weekday: 5, start_time: '10:00', end_time: '15:00' },
];

export const weekdayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export function staffName(id) {
  const s = staff.find((x) => x.id === id);
  return s ? s.name : '-';
}
export function serviceName(id) {
  const s = services.find((x) => x.id === id);
  return s ? s.name : '-';
}
export function customerName(id) {
  const c = customers.find((x) => x.id === id);
  return c ? c.name : '-';
}
export function money(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
}
