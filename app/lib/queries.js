import { supabase } from './supabaseClient';

// Devuelve el business del usuario logueado (o null si no hay sesion).
export async function getMyBusiness() {
const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;
const { data, error } = await supabase
.from('business')
.select('*')
.eq('owner_id', user.id)
.maybeSingle();
if (error) { console.error('getMyBusiness', error); return null; }
return data;
}

// Devuelve los servicios del business del usuario logueado.
export async function getMyServices() {
const biz = await getMyBusiness();
if (!biz) return [];
const { data, error } = await supabase
.from('service')
.select('*')
.eq('business_id', biz.id)
.order('name');
if (error) { console.error('getMyServices', error); return []; }
return data || [];
}

export function money(n) {
return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
}
