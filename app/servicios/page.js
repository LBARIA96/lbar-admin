'use client';

import { useEffect, useState } from 'react';
import { getMyServices, saveService, deleteService, money } from '../lib/queries';
import { getPlanLimits, getMyTier } from '../lib/subscription';
import { PageHeader, Card, Pill, Button, Modal, Field, Input, Textarea, EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

const EMPTY = { name: '', description: '', duration_minutes: 30, price: 0, is_active: true };

export default function ServiciosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [maxServices, setMaxServices] = useState(9999);
  const [limitMsg, setLimitMsg] = useState('');

  async function load() {
    setLoading(true);
    const rows = await getMyServices();
    setServices(rows);
    const tier = await getMyTier();
    setMaxServices(getPlanLimits(tier).services);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    if (services.length >= maxServices) { setLimitMsg('Llegaste al limite de servicios de tu plan. Actualiza tu plan para agregar mas.'); return; }
    setLimitMsg(''); setForm(EMPTY); setOpen(true);
  }
  function openEdit(s) { setForm({ id: s.id, name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, price: s.price, is_active: s.is_active }); setOpen(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('El nombre es obligatorio'); return; }
    setSaving(true);
    const { error } = await saveService(form);
    setSaving(false);
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setOpen(false);
    load();
  }

  async function handleDelete(s) {
    if (!confirm('Eliminar el servicio "' + s.name + '"?')) return;
    const { error } = await deleteService(s.id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    load();
  }

  return (
    <div>
      <PageHeader
        title="Servicios"
        subtitle="Catalogo de servicios ofrecidos"
        action={<Button onClick={openNew}>+ Nuevo servicio</Button>}
      />
      {limitMsg && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3">
          <span>{limitMsg}</span>
          <a href="/suscripcion" className="font-medium underline whitespace-nowrap">Ver planes</a>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : services.length === 0 ? (
        <EmptyState title="Todavia no tenes servicios cargados" subtitle="Crea tu primer servicio para empezar a recibir reservas." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Card key={s.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{s.name}</h3>
                <Pill active={s.is_active} />
              </div>
              <p className="text-sm text-slate-500 mt-1 flex-1">{s.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">{s.duration_minutes} min</span>
                <span className="text-lg font-semibold text-slate-900">{money(s.price)}</span>
              </div>
              <div className="flex gap-2 mt-3">
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
        title={form.id ? 'Editar servicio' : 'Nuevo servicio'}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </>}
      >
        <Field label="Nombre">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Corte de pelo" />
        </Field>
        <Field label="Descripcion">
          <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detalle del servicio" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Duracion (min)">
            <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </Field>
          <Field label="Precio (ARS)">
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 mt-1">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Servicio activo
        </label>
      </Modal>
    </div>
  );
}
