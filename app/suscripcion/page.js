'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { PageHeader, Card, Button } from '../components/ui';
import {
  PLANS,
  STATUS_LABELS,
  getMySubscription,
  selectPlan,
  startCheckout,
  planMoney,
} from '../lib/subscription';

export default function SuscripcionPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState('');
  const [info, setInfo] = useState('');

  async function load() {
    try {
      const { subscription } = await getMySubscription();
      setSub(subscription);
    } catch (e) {
      setError(e.message || 'No se pudo cargar la suscripcion.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function choose(tier) {
    if (!sub) return;
    setSaving(tier);
    setInfo('');
    setError(null);
    try {
      if (tier === 'free') {
        const updated = await selectPlan(sub.id, 'free');
        setSub(updated);
        setInfo('Tu plan quedo en Free.');
      } else {
                // Plan pago: intentamos abrir el checkout de Mercado Pago.
        const co = await startCheckout(sub, PLANS.find(p => p.tier === tier) || { tier, price: 0 }, null);
        if (co.configured && co.url) {
          window.location.href = co.url;
          return;
        }
        // MP todavia no esta conectado: dejamos el plan como prueba (demo).
        const updated = await selectPlan(sub.id, tier);
        setSub(updated);
        setInfo('Plan seleccionado en modo prueba. Conecta Mercado Pago (variable MP_ACCESS_TOKEN en Vercel) para cobrar de verdad.');
      }
    } catch (e) {
      setError(e.message || 'No se pudo cambiar el plan.');
    } finally {
      setSaving('');
    }
  }

  if (loading) return <div className="text-gray-500">Cargando...</div>;

  const currentTier = sub ? sub.tier : 'free';

  return (
    <div>
      <PageHeader title="Suscripcion" subtitle="Gestiona el plan de tu negocio" />

      {sub && (
        <Card>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-gray-500">Plan actual</p>
              <p className="text-xl font-bold capitalize">{currentTier}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium">{STATUS_LABELS[sub.status] || sub.status}</p>
            </div>
          </div>
          {sub.current_period_end && (
            <p className="text-xs text-gray-400 mt-2">
              Proximo vencimiento: {new Date(sub.current_period_end).toLocaleDateString('es-AR')}
            </p>
          )}
        </Card>
      )}

      {info && <p className="text-green-600 text-sm mt-4">{info}</p>}
      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.tier === currentTier;
          return (
            <div
              key={plan.tier}
              className={'border rounded-xl p-5 flex flex-col ' + (isCurrent ? 'border-black ring-1 ring-black' : 'border-gray-200')}
            >
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1">{planMoney(plan.price)}</p>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <ul className="text-sm text-gray-700 mt-4 space-y-1 flex-1">
                {plan.features.map((f) => (
                  <li key={f}>&#10003; {f}</li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <Button variant="ghost" onClick={() => {}}>Plan actual</Button>
                ) : (
                  <Button onClick={() => choose(plan.tier)}>
                    {saving === plan.tier ? 'Procesando...' : (plan.tier === 'free' ? 'Cambiar a Free' : 'Elegir ' + plan.name)}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-8 max-w-2xl">
        Nota: la integracion de cobro (Mercado Pago / Stripe) se conecta en el archivo
        app/lib/subscription.js, en la funcion selectPlan. Las claves de la pasarela
        deben cargarse como variables de entorno en Vercel, nunca en el codigo.
      </p>
    </div>
  );
}
