'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

// Forzar render dinamico: evita el prerender estatico en build time.
export const dynamic = 'force-dynamic';

export default function AdminPage() {
const router = useRouter();
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
supabase.auth.getSession().then(({ data }) => {
if (!data.session) { router.replace('/login'); return; }
setSession(data.session);
setLoading(false);
});
const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
if (!s) { router.replace('/login'); } else { setSession(s); }
});
return () => sub.subscription.unsubscribe();
}, [router]);

async function handleLogout() {
await supabase.auth.signOut();
router.replace('/login');
}

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center bg-slate-50">
<p className="text-sm text-slate-500">Cargando...</p>
</div>
);
}

const secciones = [
{ href: '/servicios', label: 'Servicios', desc: 'Define tus servicios y precios' },
{ href: '/horarios', label: 'Horarios', desc: 'Configura tu disponibilidad' },
{ href: '/staff', label: 'Equipo', desc: 'Gestiona tu personal' },
{ href: '/clientes', label: 'Clientes', desc: 'Base de clientes' },
{ href: '/reservas', label: 'Reservas', desc: 'Turnos agendados' },
];

return (
<div className="min-h-screen bg-slate-50">
<header className="bg-white border-b border-slate-100">
<div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
<div>
<h1 className="text-lg font-semibold text-slate-900">Panel de administracion</h1>
<p className="text-xs text-slate-500">{session?.user?.email}</p>
</div>
<button onClick={handleLogout} className="text-sm text-slate-600 hover:text-slate-900 underline">Cerrar sesion</button>
</div>
</header>
<main className="max-w-5xl mx-auto px-4 py-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{secciones.map((s) => (
<a key={s.href} href={s.href} className="block bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition">
<h2 className="text-base font-semibold text-slate-900">{s.label}</h2>
<p className="text-sm text-slate-500 mt-1">{s.desc}</p>
</a>
))}
</div>
</main>
</div>
);
}
