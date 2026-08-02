'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DefaultValues {
  code?: string;
  description?: string;
  dutyRate?: string;
  notes?: string;
  source?: string;
}

interface Props {
  hsCodeId?: string;
  defaultValues?: DefaultValues;
}

export function HsCodeForm({ hsCodeId, defaultValues }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      code: (fd.get('code') as string).trim(),
      description: (fd.get('description') as string).trim(),
      dutyRate: parseFloat(fd.get('dutyRate') as string),
      notes: (fd.get('notes') as string).trim() || null,
      source: (fd.get('source') as string).trim() || null,
    };

    const url = hsCodeId ? `/api/hs-codes/${hsCodeId}` : '/api/hs-codes';
    const method = hsCodeId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri snimanju.');
      return;
    }

    router.push('/admin/hs-codes');
    router.refresh();
  }

  async function handleDelete() {
    if (!hsCodeId) return;
    if (!confirm('Sigurni ste da želite obrisati ovaj HS kod? Zahtjevi kojima je dodijeljen neće biti obrisani, samo veza.')) return;
    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/hs-codes/${hsCodeId}`, { method: 'DELETE' });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri brisanju.');
      return;
    }

    router.push('/admin/hs-codes');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          HS kod <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="code"
          required
          defaultValue={defaultValues?.code}
          placeholder="npr. 9401.30"
          className="input-field font-mono"
        />
        <p className="mt-1 text-xs text-ink-400">
          Harmonizovani tarifni broj iz carinske tarife, npr. 9401.30 ili 8471.30.00
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Opis <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="description"
          required
          defaultValue={defaultValues?.description}
          placeholder="npr. Kancelarijske stolice"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Carinska stopa (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="dutyRate"
          required
          min="0"
          max="100"
          step="0.01"
          defaultValue={defaultValues?.dutyRate}
          placeholder="npr. 10.00"
          className="input-field"
        />
        <p className="mt-1 text-xs text-amber-600">
          ⚠ Unosi se isključivo na osnovu zvanične carinske tarife ili pisane potvrde od špeditera.
          Nikada ne unosite pretpostavljenu stopu.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Izvor stope</label>
        <input
          type="text"
          name="source"
          defaultValue={defaultValues?.source ?? ''}
          placeholder="npr. UIO Carinska tarifa / Ime špeditera"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Bilješka</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ''}
          placeholder="npr. Provjereno kod špeditera januar 2026"
          className="input-field resize-none"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-ink-100 pt-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Snimanje...' : hsCodeId ? 'Spremi izmjene' : 'Dodaj HS kod'}
        </button>
        <a href="/admin/hs-codes" className="text-sm text-ink-500 hover:text-ink-900">
          Odustani
        </a>
        {hsCodeId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? 'Brisanje...' : 'Obriši HS kod'}
          </button>
        )}
      </div>
    </form>
  );
}
