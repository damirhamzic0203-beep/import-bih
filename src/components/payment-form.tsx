'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['EUR', 'BAM', 'USD', 'CNY'];
const METHODS = ['Bankovni transfer', 'Gotovina', 'Kartica', 'Ostalo'];

interface Props {
  invoiceId: string;
  currency?: string;
}

export function PaymentForm({ invoiceId, currency: defaultCurrency }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    amount: '',
    currency: defaultCurrency ?? 'EUR',
    paidDate: today,
    method: METHODS[0],
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        currency: form.currency,
        paidDate: form.paidDate || null,
        method: form.method,
        notes: form.notes || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri unosu uplate.');
      return;
    }

    setForm((prev) => ({ ...prev, amount: '', notes: '' }));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Iznos</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            className="input-field"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
          />
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
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Datum uplate</label>
          <input
            type="date"
            className="input-field"
            value={form.paidDate}
            onChange={(e) => set('paidDate', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Način plaćanja</label>
          <select
            className="input-field"
            value={form.method}
            onChange={(e) => set('method', e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink-700 mb-1">Napomena (opcionalno)</label>
          <input
            className="input-field"
            placeholder="Referenca uplate, napomena..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Čuvam...' : 'Unesi uplatu'}
      </button>
    </form>
  );
}
