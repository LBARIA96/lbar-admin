'use client';

import { useEffect, useState } from 'react';
import { getMyAvailability, saveAvailability, deleteAvailability, getMyStaff, WEEKDAYS } from '../lib/queries';
import { PageHeader, Card, Button, Modal, Field, Input, Select, EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

const EMPTY = { staff_id: '', weekday: 1, start_time: '09:00', end_time: '18:00' };

export default function HorariosPage() {
  const [rules, setRules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [r, s] = await Promise.all([getMyAvailability(), getMyStaff()]);
    setRules(r);
    setStaff(s);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ ...EMPTY, staff_id: staff[0] ? staff[0].id : '' });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.staff_id) { alert('Primero crea un profesional en la seccion Staff'); return; }
    setSaving(true);
    const { error } = await saveAvailability(form);
    setSaving(false);
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setOpen(false);
    load();
  }

  async function handleDelete(r) {
    if (!confirm('Eliminar este horario?')) return;
    const { error } = await deleteAvailability(r.id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    load();
  }

  return (
    <div>
      <PageHeader
        title="Horarios"
        subtitle="Disponibilidad semanal de cada profesional"
        action={<Button onClick={openNew}>+ Nuevo horario</Button>}
      />
      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : rules.length === 0 ? (
        <EmptyState title="Todavia no definiste horarios" subtitle="Agrega franjas horarias para que tus clientes puedan reservar." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Profesional</th>
                <th className="px-4 py-3 font-medium">Dia</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 font-medium">Hasta</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.staff ? r.staff.name : '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{WEEKDAYS[r.weekday]}</td>
                  <td className="px-4 py-3 text-slate-600">{(r.start_time || '').slice(0, 5)}</td>
                  <td className="px-4 py-3 text-slate-600">{(r.end_time || '').slice(0, 5)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(r)} className="text-rose-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo horario"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </>}
      >
        <Field label="Profesional">
          <Select value={form.staff_id} onChange={(e) => setForm({ ...form, staff_id: e.target.value })}>
            {staff.length === 0 && <option value="">(Sin profesionales)</option>}
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Dia de la semana">
          <Select value={form.weekday} onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}>
            {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde">
            <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
          </Field>
          <Field label="Hasta">
            <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
