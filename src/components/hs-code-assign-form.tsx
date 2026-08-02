'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HsCodeOption {
  id: string;
  code: string;
  description: string;
  dutyRate: string;
}

interface Props {
  importRequestId: string;
  hsCodes: HsCodeOption[];
  currentHsCode?: {
    id: string;
    code: string;
    description: string;
    dutyRate: string;
    source?: string | null;
    notes?: string | null;
  } | null;
}

export function HsCodeAssignForm({ importRequestId, hsCodes, currentHsCode }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentHsCode?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(hsCodeId: string | null) {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/requests/${importRequestId}/assign-hs-code`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hsCodeId }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri dodjeli HS koda.');
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentHsCode && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="font-mono font-semibold text-ink-900">{currentHsCode.code}</p>
              <p className="text-ink-700">{currentHsCode.description}</p>
              <p className="font-medium text-brand-700">
                Carinska stopa: {parseFloat(currentHsCode.dutyRate).toFixed(2)}%
              </p>
              {currentHsCode.source && (
                <p className="text-xs text-ink-500">Izvor: {currentHsCode.source}</p>
              )}
              {currentHsCode.notes && (
                <p className="text-xs text-ink-400">{currentHsCode.notes}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => send(null)}
              disabled={saving}
              className="shrink-0 text-xs text-ink-400 hover:text-red-600 disabled:opacity-50"
            >
              Ukloni
            </button>
          </div>
        </div>
      )}

      {hsCodes.length === 0 ? (
        <p className="text-sm text-ink-400 italic">
          Baza HS kodova je prazna —{' '}
          <a
            href="/admin/hs-codes/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 hover:underline not-italic"
          >
            dodajte prvi HS kod
          </a>
          .
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-48">
            <label className="mb-1 block text-sm font-medium text-ink-700">
              {currentHsCode ? 'Promijeni HS kod' : 'Odaberi HS kod'}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="input-field"
            >
              <option value="">— Odaberi HS kod —</option>
              {hsCodes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.description} ({parseFloat(c.dutyRate).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => send(selectedId)}
            disabled={!selectedId || saving || selectedId === currentHsCode?.id}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Snimanje...' : currentHsCode ? 'Promijeni' : 'Dodijeli'}
          </button>
        </div>
      )}

      <a
        href="/admin/hs-codes/new"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-brand-600 hover:underline"
      >
        + Dodaj novi HS kod (otvara se u novom tabu)
      </a>
    </div>
  );
}
