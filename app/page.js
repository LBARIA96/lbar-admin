'use client';

import { useEffect, useState } from 'react';
import { getDashboardStats, getMyBusiness, money, fmtDate } from './lib/queries';
import { PageHeader, StatCard, Card, StatusBadge, EmptyState } from './components/ui';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [bizName, setBizName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const biz = await getMyBusiness();
      setBizName(biz ? biz.name : '');
      setStats(await getDashboardStats());
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Inicio"
        subtitle={bizName ? ('Resumen de ' + bizName) : 'Resumen de tu negocio'}
      />
      {loading || !stats ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Servicios" value={stats.services} />
            <StatCard label="Profesionales" value={stats.staff} />
            <StatCard label="Clientes" value={stats.customers} />
            <StatCard label="Proximos turnos" value={stats.upcoming.length} />
          </div>

          <h2 className="text-lg font-semibold text-slate-900 mb-3">Proximos turnos</h2>
          {stats.upcoming.length === 0 ? (
            <EmptyState title="No tenes turnos proximos" subtitle="Cuando agendes reservas las vas a ver aca." />
          ) : (
            <div className="space-y-3">
              {stats.upcoming.map((a) => (
                <Card key={a.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{a.service ? a.service.name : 'Servicio'}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{a.customer ? a.customer.name : 'Cliente'}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{fmtDate(a.starts_at)}</p>
                  </div>
                  {a.price != null && <span className="text-sm font-semibold text-slate-700">{money(a.price)}</span>}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
