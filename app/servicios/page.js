'use client';

import { useEffect, useState } from 'react';
import { getMyServices, money } from '../lib/queries';
import { PageHeader, Card, Pill, Button } from '../components/ui';

export const dynamic = 'force-dynamic';

export default function ServiciosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getMyServices().then((rows) => { setServices(rows); setLoading(false); });
  }, []);
  return (
    <div>
    <PageHeader
  title="Servicios"
  subtitle="Catalogo de servicios ofrecidos"
  action={<Button>+ Nuevo servicio</Button>}
  />
  {loading ? (
    <p className="text-sm text-slate-500">Cargando...</p>
    ) : services.length === 0 ? (
    <div className="border border-dashed border-slate-300 rounded-lg p-10 text-center">
    <p className="text-slate-600 font-medium">Todavia no tenes servicios cargados</p>
    <p className="text-sm text-slate-400 mt-1">Crea tu primer servicio para empezar a recibir reservas.</p>
    </div>
    ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {services.map((s) => (
    <Card key={s.id} className="p-5 flex flex-col">
  <div className="flex items-start justify-between">
  <h3 className="font-semibold text-slate-900">{s.name}</h3>
<Pill active={s.is_active} />
  </div>
<p className="text-sm text-slate-500 mt-1 flex-1">{s.description}</p>
<div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
  <span className="text-sm text-slate-500">{s.duration_minutes} min</span>
<span className="text-lg font-semibold text-slate-900">{money(s.price)}</span>
  </div>
  </Card>
))}
  </div>
)}
</div>
);
}
