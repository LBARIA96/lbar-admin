import { staff } from '../lib/data';
import { PageHeader, Card, Pill, Button } from '../components/ui';

function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function StaffPage() {
  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Equipo que atiende los turnos"
        action={<Button>+ Agregar miembro</Button>}
      />
      <Card className="overflow-hidden">
        <ul className="divide-y divide-slate-100">
          {staff.map((m) => (
            <li key={m.id} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold text-sm">
                  {initials(m.name)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.role}</p>
                </div>
              </div>
              <Pill active={m.active} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
