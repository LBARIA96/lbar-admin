import { customers, appointments } from '../lib/data';
import { PageHeader, Card, Button } from '../components/ui';

export default function ClientesPage() {
  function countFor(id) {
    return appointments.filter((a) => a.customer_id === id).length;
  }
  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes del negocio"
        action={<Button>+ Nuevo cliente</Button>}
      />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Cliente</th>
              <th className="px-5 py-3 font-medium">Telefono</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Turnos</th>
              <th className="px-5 py-3 font-medium">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-900">{c.name}</td>
                <td className="px-5 py-3.5 text-slate-700">{c.phone}</td>
                <td className="px-5 py-3.5 text-slate-700">{c.email}</td>
                <td className="px-5 py-3.5 text-slate-700">{countFor(c.id)}</td>
                <td className="px-5 py-3.5 text-slate-500">{c.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
