'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  getBusinessBySlug,
  getPublicServices,
  getPublicStaff,
  getAvailabilityRules,
  getAppointmentsForDay,
  buildSlots,
  createPublicBooking,
  moneyFmt,
} from '../../lib/public';

export default function ReservarPage({ params }) {
  const slug = params.slug;
  const [loading, setLoading] = useState(true);
  const [biz, setBiz] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState(null);

  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [slots, setSlots] = useState([]);
  const [slot, setSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const b = await getBusinessBySlug(slug);
        if (!b) { setError('No encontramos este negocio.'); setLoading(false); return; }
        setBiz(b);
        const [sv, st, rl] = await Promise.all([
          getPublicServices(b.id),
          getPublicStaff(b.id),
          getAvailabilityRules(b.id),
        ]);
        setServices(sv);
        setStaff(st);
        setRules(rl);
      } catch (e) {
        setError(e.message || 'Error al cargar.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const service = services.find((s) => s.id === serviceId);

  async function loadSlots(nextDate, nextStaff, nextService) {
    const d = nextDate ?? dateStr;
    const stf = nextStaff ?? staffId;
    const svId = nextService ?? serviceId;
    if (!d || !stf || !svId || !biz) { setSlots([]); return; }
    setLoadingSlots(true);
    setSlot('');
    try {
      const dayStart = new Date(d + 'T00:00:00').toISOString();
      const dayEnd = new Date(d + 'T23:59:59').toISOString();
      const busy = await getAppointmentsForDay(biz.id, stf, dayStart, dayEnd);
      const sv = services.find((s) => s.id === svId);
      const staffRules = rules.filter((r) => r.staff_id === stf);
      const result = buildSlots(d, staffRules, busy, sv ? sv.duration_minutes : 30, biz.slot_interval_minutes || 30);
      setSlots(result);
    } catch (e) {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!service || !staffId || !dateStr || !slot || !name) return;
    setSaving(true);
    try {
      const startsAt = new Date(dateStr + 'T' + slot + ':00');
      const endsAt = new Date(startsAt.getTime() + (service.duration_minutes || 30) * 60000);
      await createPublicBooking({
        businessId: biz.id,
        serviceId: service.id,
        staffId,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        price: service.price,
        customer: { name, phone, email, notes },
      });
      setDone(true);
    } catch (err) {
      setError('No pudimos confirmar el turno. Proba de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  if (loading) return <Centered>Cargando...</Centered>;
  if (error && !biz) return <Centered>{error}</Centered>;

  if (done) {
    return (
      <Centered>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">&#10003;</div>
          <h1 className="text-2xl font-bold mb-2">&iexcl;Turno solicitado!</h1>
          <p className="text-gray-600">
            Tu reserva en {biz.name} qued&oacute; registrada como pendiente.
            {biz.requires_confirmation ? ' Te vamos a confirmar a la brevedad.' : ' Te esperamos.'}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {service && service.name} &middot; {dateStr} &middot; {slot} hs
          </div>
        </div>
      </Centered>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{biz.name}</h1>
          <p className="text-gray-500 text-sm">Reserv&aacute; tu turno online</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={submit} className="space-y-6">
          <Section title="1. Eleg&iacute; el servicio">
            <div className="grid gap-2">
              {services.length === 0 && <p className="text-gray-500 text-sm">No hay servicios disponibles.</p>}
              {services.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => { setServiceId(s.id); loadSlots(undefined, undefined, s.id); }}
                  className={'text-left border rounded-lg p-3 transition ' + (serviceId === s.id ? 'border-black bg-gray-100' : 'border-gray-200 hover:border-gray-400')}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-sm text-gray-600">{moneyFmt(biz.currency, s.price)}</span>
                  </div>
                  <div className="text-xs text-gray-500">{s.duration_minutes} min{s.description ? ' \u00b7 ' + s.description : ''}</div>
                </button>
              ))}
            </div>
          </Section>

          {serviceId && (
            <Section title="2. Eleg&iacute; el profesional">
              <div className="grid gap-2">
                {staff.length === 0 && <p className="text-gray-500 text-sm">No hay profesionales disponibles.</p>}
                {staff.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setStaffId(p.id); loadSlots(undefined, p.id, undefined); }}
                    className={'text-left border rounded-lg p-3 transition ' + (staffId === p.id ? 'border-black bg-gray-100' : 'border-gray-200 hover:border-gray-400')}
                  >
                    <span className="font-medium">{p.name}</span>
                  </button>
                ))}
              </div>
            </Section>
          )}

          {staffId && (
            <Section title="3. Eleg&iacute; d&iacute;a y horario">
              <input
                type="date"
                min={today}
                value={dateStr}
                onChange={(e) => { setDateStr(e.target.value); loadSlots(e.target.value, undefined, undefined); }}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4"
              />
              {dateStr && (
                loadingSlots ? (
                  <p className="text-gray-500 text-sm">Buscando horarios...</p>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay horarios disponibles ese d&iacute;a.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setSlot(t)}
                        className={'border rounded-lg py-2 text-sm transition ' + (slot === t ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400')}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )
              )}
            </Section>
          )}

          {slot && (
            <Section title="4. Tus datos">
              <div className="grid gap-3">
                <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Nombre y apellido *" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Tel\u00e9fono" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <textarea className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </Section>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          {slot && (
            <button
              type="submit"
              disabled={saving || !name}
              className="w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-50"
            >
              {saving ? 'Confirmando...' : 'Confirmar turno'}
            </button>
          )}
        </form>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold mb-3 text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function Centered({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-gray-700">
      {children}
    </div>
  );
}
