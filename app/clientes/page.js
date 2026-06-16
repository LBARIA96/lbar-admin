'use client';

import { useEffect, useState } from 'react';
import { getMyCustomers, saveCustomer, deleteCustomer } from '../lib/queries';
import { PageHeader, Card, Button, Modal, Field, Input, Textarea, EmptyState } from '../components/ui';

export const dynamic = 'force-dynamic';

const EMPTY = { name: '', phone: '', email: '', notes: '' };

export default function ClientesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');

  async function load() {
    setLoading(true);
    setItems(await getMyCustomers());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() { setForm(EMPTY); setOpen(true); }
  function openEdit(c) { setForm({ id: c.id, name: c.name, phone: c.phone || '', email: c.email || '', notes: c.notes || '' }); setOpen(true); }

  async function handleSave() {
    if (!form.name.trim()) { alert('El nombre es obligatorio'); return; }
    setSaving(true);
    const { error } = await saveCustomer(form);
    setSaving(false);
    if (error) { alert('Error al guardar: ' + error.message); return; }
    setOpen(false);
    load();
  }

  async function handleDelete(c) {
    if (!confirm('Eliminar al cliente "' + c.name + '"?')) return;
    const { error } = await deleteCustomer(c.id);
    if (error) { alert('Error al eliminar: ' + error.message); return; }
    load();
  }

  const filtered = items.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || (c.phone || '').includes(q));

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes de tu negocio"
        action={<Button onClick={openNew}>+ Nuevo cliente</Button>}
      />
      <div className="mb-4 max-w-xs">
        <Input placeholder="Buscar por nombre o telefono" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No hay clientes" subtitle="Los clientes apareceran aca cuando reserven o los agregues manualmente." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Telefono</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(c)} className="text-brand hover:underline mr-3">Editar</button>
                    <button onClick={() => handleDelete(c)} className="text-rose-600 hover:underline">Eliminar</button>
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
        title={form.id ? 'Editar cliente' : 'Nuevo cliente'}
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </>}
      >
        <Field label="Nombre">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del cliente" />
        </Field>
        <Field label="Telefono">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="11 1234 5678" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@ejemplo.com" />
        </Field>
        <Field label="Notas">
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas internas" />
        </Field>
      </Modal>
    </div>
  );
}
