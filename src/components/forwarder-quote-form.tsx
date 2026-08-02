'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Recipient {
  forwarderId: string;
  forwarderName: string;
}

interface Props {
  transportRequestId: string;
  recipients: Recipient[];
}

interface FormData {
  forwarderId: string;
  price: string;
  currency: string;
  transitDays: string;
  validUntil: string;
  pickupCost: string;
  freightCost: string;
  customsCost: string;
  deliveryCost: string;
  insuranceCost: string;
  otherFees: string;
  notes: string;
}

const CURRENCIES = ['EUR', 'BAM', 'USD', 'CNY'];

function parseNum(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

export function ForwarderQuoteForm({ transportRequestId, recipients }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    forwarderId: recipients[0]?.forwarderId ?? '',
    price: '',
    currency: 'EUR',
    transitDays: '',
    validUntil: '',
    pickupCost: '',
    freightCost: '',
    customsCost: '',
    deliveryCost: '',
    insuranceCost: '',
    otherFees: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const computedTotal = useMemo(() => {
    const sum =
      parseNum(form.pickupCost) +
      parseNum(form.freightCost) +
      parseNum(form.customsCost) +
      parseNum(form.deliveryCost) +
      parseNum(form.insuranceCost) +
      parseNum(form.otherFees);
    if (sum > 0) return sum;
    if (form.price) return parseNum(form.price);
    return null;
  }, [
    form.pickupCost,
    form.freightCost,
    form.customsCost,
    form.deliveryCost,
    form.insuranceCost,
    form.otherFees,
    form.price,
  ]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      forwarderId: form.forwarderId,
      price: form.price ? parseFloat(form.price) : null,
      currency: form.currency,
      transitDays: form.transitDays ? parseInt(form.transitDays, 10) : null,
      validUntil: form.validUntil || null,
      pickupCost: form.pickupCost ? parseFloat(form.pickupCost) : null,
      freightCost: form.freightCost ? parseFloat(form.freightCost) : null,
      customsCost: form.customsCost ? parseFloat(form.customsCost) : null,
      deliveryCost: form.deliveryCost ? parseFloat(form.deliveryCost) : null,
      insuranceCost: form.insuranceCost ? parseFloat(form.insuranceCost) : null,
      otherFees: form.otherFees ? parseFloat(form.otherFees) : null,
      totalCost: computedTotal,
      notes: form.notes || null,
    };

    const res = await fetch(`/api/transport-requests/${transportRequestId}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Greška pri čuvanju ponude.');
      return;
    }

    setForm((prev) => ({
      ...prev,
      price: '',
      transitDays: '',
      validUntil: '',
      pickupCost: '',
      freightCost: '',
      customsCost: '',
      deliveryCost: '',
      insuranceCost: '',
      otherFees: '',
      notes: '',
    }));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Transporter <span className="text-red-500">*</span>
          </label>
          <select
            className="input-field"
            value={form.forwarderId}
            onChange={(e) => set('forwarderId', e.target.value)}
            required
          >
            {recipients.map((r) => (
              <option key={r.forwarderId} value={r.forwarderId}>
                {r.forwarderName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Valuta</label>
          <select
            className="input-field"
            value={form.currency}
            onChange={(e) => set('currency', e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Ukupna cijena (opciono)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            placeholder="samo ako nema stavki"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Tranzit (dana)</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={form.transitDays}
            onChange={(e) => set('transitDays', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Vrijedi do</label>
          <input
            type="date"
            className="input-field"
            value={form.validUntil}
            onChange={(e) => set('validUntil', e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink-700 mb-2">Stavke troškova</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              ['pickupCost', 'Pickup Kina'],
              ['freightCost', 'Freight'],
              ['customsCost', 'Carina'],
              ['deliveryCost', 'Dostava'],
              ['insuranceCost', 'Osiguranje'],
              ['otherFees', 'Ostalo'],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-ink-600 mb-1">{label}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field text-sm"
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {computedTotal !== null && (
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3">
          <span className="text-sm text-brand-700 font-medium">
            Izračunati ukupni trošak:{' '}
            <span className="text-lg font-bold text-brand-900">
              {mounted ? computedTotal.toLocaleString('bs-BA', { minimumFractionDigits: 2 }) : computedTotal.toFixed(2)}{' '}
              {form.currency}
            </span>
          </span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Napomene</label>
        <textarea
          rows={2}
          className="input-field"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Dodajem...' : 'Dodaj ponudu'}
      </button>
    </form>
  );
}
