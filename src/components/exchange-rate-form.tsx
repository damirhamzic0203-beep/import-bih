'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['EUR', 'BAM', 'USD', 'CNY'];

export function ExchangeRateForm() {
  const router = useRouter();
  const [form, setForm] = useState({ fromCurrency: 'USD', toCurrency: 'EUR', rate: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/exchange-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromCurrency: form.fromCurrency,
        toCurrency: form.toCurrency,
        rate: parseFloat(form.rate),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri čuvanju kursa.');
      return;
    }

    setForm((prev) => ({ ...prev, rate: '' }));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-600">Od</label>
        <select
          className="input-field w-28"
          value={form.fromCurrency}
          onChange={(e) => set('fromCurrency', e.target.value)}
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-600">Do</label>
        <select
          className="input-field w-28"
          value={form.toCurrency}
          onChange={(e) => set('toCurrency', e.target.value)}
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-600">Kurs</label>
        <input
          type="number"
          required
          min="0.000001"
          step="0.000001"
          className="input-field w-36"
          placeholder="npr. 1.082000"
          value={form.rate}
          onChange={(e) => set('rate', e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Čuvam...' : 'Spremi kurs'}
      </button>
    </form>
  );
}
