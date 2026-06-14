import { staff, availabilityRules, weekdayNames } from '../lib/data';
import { PageHeader, Card, Button } from '../components/ui';

export default function HorariosPage() {
  return (
    <div>
      <PageHeader
        title="Horarios"
        subtitle="Disponibilidad semanal por miembro del staff"
        action={<Button>+ Nueva regla</Button>}
      />
      <div className="space-y-5">
        {staff.map((m) => {
          const rules = availabilityRules
            .filter((r) => r.staff_id === m.id)
            .sort((a, b) => a.weekday - b.weekday);
          return (
            <Card key={m.id}>
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{m.name}</h3>
                <span className="text-xs text-slate-500">{m.role}</span>
              </div>
              {rules.length === 0 ? (
                <p className="px-5 py-6 text-center text-sm text-slate-400">Sin horarios cargados.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-5">
                  {rules.map((r) => (
                    <div key={r.id} className="rounded-lg border border-slate-200 px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-500">{weekdayNames[r.weekday]}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{r.start_time} - {r.end_time}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
