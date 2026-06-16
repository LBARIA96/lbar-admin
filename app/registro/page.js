'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function RegistroPage() {
const [businessName, setBusinessName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState(null);
const [done, setDone] = useState(false);
const [loading, setLoading] = useState(false);

async function handleSignup(e) {
e.preventDefault();
setLoading(true);
setError(null);
const { error } = await supabase.auth.signUp({
email,
password,
options: { data: { business_name: businessName } },
});
setLoading(false);
if (error) { setError(error.message); return; }
setDone(true);
}

if (done) {
return (
<div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
<div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
<h1 className="text-xl font-semibold text-slate-900">Revisa tu email</h1>
<p className="text-sm text-slate-500 mt-2">Te enviamos un enlace para confirmar tu cuenta. Una vez confirmada, vas a poder ingresar.</p>
<Link href="/login" className="inline-block mt-6 text-sm text-slate-900 font-medium underline">Ir a iniciar sesion</Link>
</div>
</div>
);
}

return (
<div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
<div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
<h1 className="text-xl font-semibold text-slate-900">Crear cuenta</h1>
<p className="text-sm text-slate-500 mt-1">Registra tu emprendimiento para gestionar turnos</p>
<form onSubmit={handleSignup} className="mt-6 space-y-4">
<div>
<label className="block text-xs font-medium text-slate-600 mb-1">Nombre del negocio</label>
<input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
</div>
<div>
<label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
</div>
<div>
<label className="block text-xs font-medium text-slate-600 mb-1">Contrasena</label>
<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
</div>
{error && <p className="text-sm text-red-600">{error}</p>}
<button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{loading ? 'Creando...' : 'Crear cuenta'}</button>
</form>
<p className="text-sm text-slate-500 mt-4">Ya tenes cuenta? <Link href="/login" className="text-slate-900 font-medium underline">Inicia sesion</Link></p>
</div>
</div>
);
}
