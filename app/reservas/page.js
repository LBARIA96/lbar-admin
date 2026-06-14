import { appointments, customerName, serviceName, staffName, money } from '../lib/data';
import { PageHeader, Card, StatusBadge, Button } from '../components/ui';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' });
}
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const filters = ['Todas', 'Pendiente', 'Confirmada', 'Cancelada', 'Completada'];

export default function ReservasPage() {
  const rows = [...appointments].sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Gestiona los turnos del negocio"
        action={<Button>+ Nueva reserva</Button>}
      />
      <div className="flex gap-2 mb-4">
        {filters.map((f, i) => (
          <button
            key={f}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Fecha</th>
              <th className="px-5 py-3 font-medium">Hora</th>
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Servicio</th>
              <th className="px-5 py-3 font-medium">Staff</th>
              <th className="px-5 py-3 font-medium">Precio</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 text-slate-700 capitalize">{fmtDate(a.starts_at)}</td>
                <td className="px-5 py-3.5 text-slate-700">{fmtTime(a.starts_at)} - {fmtTime(a.ends_at)}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{customerName(a.customer_id)}</td>
                <td className="px-5 py-3.5 text-slate-700">{serviceName(a.service_id)}</td>
                <td className="px-5 py-3.5 text-slate-700">{staffName(a.staff_id)}</td>
                <td className="px-5 py-3.5 text-slate-700">{money(a.price)}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
