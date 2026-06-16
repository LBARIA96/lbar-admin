'use client';

import { useEffect, useState } from 'react';
import { getMyAppointments, updateAppointmentStatus, createAppointment, getMyServices, getMyStaff, getMyCustomers, money, fmtDate } from '../lib/queries';
import { PageHeader, Card, Button, Modal, Field, Input, Select, StatusBadge, EmptyState } from '../components/ui';
import { hasConflict } from '../lib/public';

export const dynamic = 'force-dynamic';

export default function ReservasPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ service_id: '', staff_id: '', customer_id: '', date: '', time: '09:00' });

  async function load() {
    setLoading(true);
    setItems(await getMyAppointments());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function openNew() {
    const [sv, st, cu] = await Promise.all([getMyServices(), getMyStaff(), getMyCustomers()]);
    setServices(sv); setStaff(st); setCustomers(cu);
    setForm({ service_id: sv[0] ? sv[0].id : '', staff_id: st[0] ? st[0].id : '', customer_id: cu[0] ? cu[0].id : '', date: '', time: '09:00' });
    setOpen(true);
  }

  async function handleCreate() {
    if (!form.service_id || !form.staff_id || !form.customer_id || !form.date) {
      alert('Completa servicio, profesional, cliente y fecha'); return;
    }
    const svc = services.find((s) => s.id === form.service_id);
    const dur = svc ? svc.duration_minutes : 30;
    const starts = new Date(form.date + 'T' + form.time + ':00');
    const ends = new Date(starts.getTime() + dur * 60000);
    const conflict = await hasConflict(null, form.staff_id, starts.toISOString(), ends.toISOString());
    if (conflict) { alert('Ese profesional ya tiene un turno en ese horario.'); return; }
    setSaving(true);
    const { error } = await createAppointment({
      service_id: form.service_id,
      staff_id: form.staff_id,
      customer_id: form.customer_id,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      status: 'confirmed',
      price: svc ? svc.price : null,
    });
    setSaving(false);
    if (error) { alert('Error al crear: ' + error.message); return; }
    setOpen(false);
    load();
  }

  async function setStatus(a, status) {
    const { error } = await updateAppointmentStatus(a.id, status);
    if (error) { alert('Error: ' + error.message); return; }
    load();
  }

  const filtered = filter === 'all' ? items : items.filter((a) => a.status === filter);
  const FILTERS = [['all', 'Todas'], ['pending', 'Pendientes'], ['confirmed', 'Confirmadas'], ['completed', 'Completadas'], ['cancelled', 'Canceladas']];

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Turnos agendados de tu negocio"
        action={<Button onClick={openNew}>+ Nueva reserva</Button>}
      />
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} className={'px-3 py-1.5 rounded-full text-sm font-medium ' + (filter === key ? 'bg-brand text-white' : 'bg-white border border-slate-200 text-slate-600')}>{label}</button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay reservas" subtitle="Las reservas apareceran aca cuando tus clientes agenden o las crees manualmente." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Card key={a.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{a.service ? a.service.name : 'Servicio'}</span>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{a.customer ? a.customer.name : 'Cliente'} · {a.staff ? a.staff.name : 'Staff'}</p>
                <p className="text-sm text-slate-400 mt-0.5">{fmtDate(a.starts_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {a.price != null && <span className="text-sm font-semibold text-slate-700 mr-2">{money(a.price)}</span>}
                {a.status !== 'confirmed' && a.status !== 'cancelled' && <Button variant="ghost" onClick={() => setStatus(a, 'confirmed')}>Confirmar</Button>}
                {a.status !== 'completed' && a.status !== 'cancelled' && <Button variant="ghost" onClick={() => setStatus(a, 'completed')}>Completar</Button>}
                {a.status !== 'cancelled' && <Button variant="danger" onClick={() => setStatus(a, 'cancelled')}>Cancelar</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nueva reserva"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? 'Guardando...' : 'Crear reserva'}</Button>
        </>}
      >
        <Field label="Servicio">
          <Select value={form.service_id} onChange={(e) => setForm({ ...form, service_id: e.target.value })}>
            {services.length === 0 && <option value="">(Sin servicios)</option>}
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Profesional">
          <Select value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })}>
            {staff.length === 0 && <option value="">(Sin profesionales)</option>}
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Cliente">
          <Select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
            {customers.length === 0 && <option value="">(Sin clientes)</option>}
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Hora">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
