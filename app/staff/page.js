'use client';

import { useEffect, useState } from 'react';
import { getMyStaff, saveStaff, deleteStaff } from '../lib/queries';
import { getPlanLimits, getMyTier } from '../lib/subscription';
import { PageHeader, Card, Pill, Button, Modal, Field, Input, EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

const EMPTY = { name: '', email: '', is_active: true };

export default function StaffPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [maxStaff, setMaxStaff] = useState(9999);
  const [limitMsg, setLimitMsg] = useState('');

  async function load() {
    setLoading(true);
    setItems(await getMyStaff());
    const tier = await getMyTier();
    setMaxStaff(getPlanLimits(tier).staff);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    if (items.length >= maxStaff) { setLimitMsg('Llegaste al limite de profesionales de tu plan. Actualiza tu plan para agregar mas.'); return; }
    setLimitMsg(''); setForm(EMPTY); setOpen(true);
  }
  function openEdit(s) { setForm({ id: s.id, name: s.name, email: s.email || '', is_active: s.is_active }); setOpen(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('El nombre es obligatorio'); return; }
    setSaving(true);
    const { error } = await saveStaff(form);
    setSaving(false);
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setOpen(false);
    load();
  }

  async function handleDelete(s) {
    if (!confirm('Eliminar a "' + s.name + '"?')) return;
    const { error } = await deleteStaff(s.id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    load();
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Profesionales que atienden los turnos"
        action={<Button onClick={openNew}>+ Nuevo profesional</Button>}
      />
      {limitMsg && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
          <span>{limitMsg}</span>
          <a href="/suscripcion" className="font-medium underline whitespace-nowrap">Ver planes</a>
        </div>
      )}          
      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : items.length === 0 ? (
        <EmptyState title="Todavia no tenes profesionales cargados" subtitle="Agrega a tu equipo para asignar turnos." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{s.name}</h3>
                  {s.email && <p className="text-sm text-slate-500 mt-0.5">{s.email}</p>}
                </div>
                <Pill active={s.is_active} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="ghost" className="flex-1" onClick={() => openEdit(s)}>Editar</Button>
                <Button variant="danger" onClick={() => handleDelete(s)}>Eliminar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? 'Editar profesional' : 'Nuevo profesional'}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </>}
      >
        <Field label="Nombre">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Maria Gomez" />
        </Field>
        <Field label="Email (opcional)">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="maria@ejemplo.com" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700 mt-1">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Activo
        </label>
      </Modal>
    </div>
  );
}
