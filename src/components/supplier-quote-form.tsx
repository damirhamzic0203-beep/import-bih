'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  importRequestId: string;
}

interface FormData {
  unitPrice: string;
  quantity: string;
  moq: string;
  packagingCost: string;
  toolingCost: string;
  shippingChina: string;
  inspectionCost: string;
  otherCosts: string;
  currency: string;
}

const CURRENCIES = ['USD', 'CNY', 'EUR'];

function n(v: string): number {
  const parsed = parseFloat(v);
  return isNaN(parsed) ? 0 : parsed;
}

export function SupplierQuoteForm({ importRequestId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    unitPrice: '',
    quantity: '',
    moq: '',
    packagingCost: '',
    toolingCost: '',
    shippingChina: '',
    inspectionCost: '',
    otherCosts: '',
    currency: 'USD',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const supplierTotal = useMemo(() => {
    const unitTotal = n(form.unitPrice) * Math.max(n(form.quantity), 1);
    return (
      unitTotal +
      n(form.packagingCost) +
      n(form.toolingCost) +
      n(form.shippingChina) +
      n(form.inspectionCost) +
      n(form.otherCosts)
    );
  }, [form]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/requests/${importRequestId}/supplier-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitPrice: form.unitPrice ? parseFloat(form.unitPrice) : null,
        quantity: form.quantity ? parseInt(form.quantity, 10) : null,
        moq: form.moq ? parseInt(form.moq, 10) : null,
        packagingCost: form.packagingCost ? parseFloat(form.packagingCost) : null,
        toolingCost: form.toolingCost ? parseFloat(form.toolingCost) : null,
        shippingChina: form.shippingChina ? parseFloat(form.shippingChina) : null,
        inspectionCost: form.inspectionCost ? parseFloat(form.inspectionCost) : null,
        otherCosts: form.otherCosts ? parseFloat(form.otherCosts) : null,
        currency: form.currency,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Greška pri čuvanju.');
      return;
    }

    router.refresh();
  }

  const costFields: [keyof FormData, string][] = [
    ['packagingCost', 'Pakovanje'],
    ['toolingCost', 'Alat / kalupi'],
    ['shippingChina', 'Transport unutar Kine'],
    ['inspectionCost', 'Inspekcija'],
    ['otherCosts', 'Ostalo'],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Cijena po jedinici</label>
          <input
            type="number" min="0" step="0.0001" className="input-field"
            value={form.unitPrice}
            onChange={(e) => set('unitPrice', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Količina</label>
          <input
            type="number" min="1" className="input-field"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">MOQ</label>
          <input
            type="number" min="1" className="input-field"
            value={form.moq}
            onChange={(e) => set('moq', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {costFields.map(([field, label]) => (
          <div key={field}>
            <label className="block text-xs font-medium text-ink-600 mb-1">{label}</label>
            <input
              type="number" min="0" step="0.01" className="input-field text-sm"
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1">Valuta</label>
          <select
            className="input-field text-sm"
            value={form.currency}
            onChange={(e) => set('currency', e.target.value)}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {supplierTotal > 0 && (
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-brand-700">Ukupni trošak dobavljača</span>
          <span className="text-lg font-bold text-brand-900">
            {mounted ? supplierTotal.toLocaleString('bs-BA', { minimumFractionDigits: 2 }) : supplierTotal.toFixed(2)} {form.currency}
          </span>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Čuvam...' : 'Dodaj trošak dobavljača'}
      </button>
    </form>
  );
}
