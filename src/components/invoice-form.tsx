'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['EUR', 'BAM', 'USD', 'CNY'];

interface Props {
  orderId: string;
  defaultAmount?: string;
  currency?: string;
}

export function InvoiceForm({ orderId, defaultAmount, currency: defaultCurrency }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    amount: defaultAmount ?? '',
    currency: defaultCurrency ?? 'EUR',
    dueDate: '',
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

    const res = await fetch(`/api/orders/${orderId}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: form.amount ? parseFloat(form.amount) : null,
        currency: form.currency,
        dueDate: form.dueDate || null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri kreiranju fakture.');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Iznos</label>
          <input
            type="number"
            min="0"
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
          <label className="block text-sm font-medium text-ink-700 mb-1">Rok plaćanja</label>
          <input
            type="date"
            className="input-field"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Kreiram...' : 'Kreiraj fakturu'}
      </button>
    </form>
  );
}
