import { services, money } from '../lib/data';
import { PageHeader, Card, Pill, Button } from '../components/ui';

export default function ServiciosPage() {
  return (
    <div>
      <PageHeader
        title="Servicios"
        subtitle="Catalogo de servicios ofrecidos"
        action={<Button>+ Nuevo servicio</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <Card key={s.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-900">{s.name}</h3>
              <Pill active={s.active} />
            </div>
            <p className="text-sm text-slate-500 mt-1 flex-1">{s.description}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">{s.duration_min} min</span>
              <span className="text-lg font-semibold text-slate-900">{money(s.price)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
