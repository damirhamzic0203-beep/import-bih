'use client';

import { useState } from 'react';

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    message: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri slanju poruke. Pokušajte ponovo.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-lg font-semibold text-emerald-800">Poruka uspješno poslana!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Javit ćemo vam se u najkraćem mogućem roku.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Ime i prezime <span className="text-red-500">*</span>
          </label>
          <input
            required
            className="input-field"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Firma</label>
          <input
            className="input-field"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Telefon</label>
          <input
            type="tel"
            className="input-field"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Poruka <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          className="input-field resize-none"
          placeholder="Opišite šta želite uvesti, količine, rok..."
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Šaljem...' : 'Pošalji poruku'}
      </button>
    </form>
  );
}
