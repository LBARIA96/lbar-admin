import { appointments, customerName, serviceName, staffName, money } from './lib/data';
import { PageHeader, StatCard, Card, StatusBadge } from './components/ui';

function isSameDay(iso, ref) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}
function hhmm(iso) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const today = new Date();
  const todays = appointments
    .filter((a) => isSameDay(a.starts_at, today) && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const revenue = appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'completed')
    .reduce((s, a) => s + (a.price || 0), 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Resumen de actividad del negocio" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Turnos hoy" value={todays.length} hint="No cancelados" />
        <StatCard label="Confirmadas" value={confirmed} hint="En total" />
        <StatCard label="Pendientes" value={pending} hint="Requieren confirmacion" />
        <StatCard label="Ingresos" value={money(revenue)} hint="Confirmadas + completadas" />
      </div>
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Agenda de hoy</h2>
        </div>
        {todays.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">No hay turnos para hoy.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {todays.map((a) => (
              <li key={a.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700 w-14">{hhmm(a.starts_at)}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{customerName(a.customer_id)}</p>
                    <p className="text-xs text-slate-500">{serviceName(a.service_id)} &middot; {staffName(a.staff_id)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">{money(a.price)}</span>
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
