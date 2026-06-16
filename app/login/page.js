'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

// Forzar render dinamico: evita el prerender estatico en build time.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
const router = useRouter();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState(null);
const [loading, setLoading] = useState(false);

async function handleLogin(e) {
e.preventDefault();
setLoading(true);
setError(null);
const { error } = await supabase.auth.signInWithPassword({ email, password });
setLoading(false);
if (error) { setError(error.message); return; }
router.push('/admin');
}

return (
<div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
<div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
<h1 className="text-xl font-semibold text-slate-900">Iniciar sesion</h1>
<p className="text-sm text-slate-500 mt-1">Accede al panel de tu negocio</p>
<form onSubmit={handleLogin} className="mt-6 space-y-4">
<div>
<label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
</div>
<div>
<label className="block text-xs font-medium text-slate-600 mb-1">Contrasena</label>
<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
</div>
{error && <p className="text-sm text-red-600">{error}</p>}
<button type="submit" disabled={loading} className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50">{loading ? 'Ingresando...' : 'Ingresar'}</button>
</form>
<p className="text-sm text-slate-500 mt-4">No tenes cuenta? <Link href="/registro" className="text-slate-900 font-medium underline">Registrate</Link></p>
</div>
</div>
);
}
