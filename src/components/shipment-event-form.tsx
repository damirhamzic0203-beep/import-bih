'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUGGESTED_LABELS = [
  'China Warehouse',
  'Export Customs',
  'Departed China',
  'In Transit',
  'EU Transit',
  'Bosnia Customs',
  'Delivery',
  'Completed',
];

interface Props {
  shipmentId: string;
}

export function ShipmentEventForm({ shipmentId }: Props) {
  const router = useRouter();

  function getLocalNow() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  const [labelMode, setLabelMode] = useState<'select' | 'custom'>('select');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [occurredAt, setOccurredAt] = useState(getLocalNow);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const label = labelMode === 'select' ? selectedLabel : customLabel;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      setError('Unesite naziv događaja.');
      return;
    }
    setSaving(true);
    setError('');

    const res = await fetch(`/api/shipments/${shipmentId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim(), occurredAt, note: note || null }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri dodavanju događaja.');
      return;
    }

    setSelectedLabel('');
    setCustomLabel('');
    setNote('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-700 cursor-pointer">
          <input
            type="radio"
            checked={labelMode === 'select'}
            onChange={() => setLabelMode('select')}
          />
          Odaberi korak
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-700 cursor-pointer">
          <input
            type="radio"
            checked={labelMode === 'custom'}
            onChange={() => setLabelMode('custom')}
          />
          Slobodan tekst
        </label>
      </div>

      {labelMode === 'select' ? (
        <select
          className="input-field"
          value={selectedLabel}
          onChange={(e) => setSelectedLabel(e.target.value)}
        >
          <option value="">— Odaberite korak —</option>
          {SUGGESTED_LABELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      ) : (
        <input
          className="input-field"
          placeholder="Naziv događaja..."
          value={customLabel}
          onChange={(e) => setCustomLabel(e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1">Datum i vrijeme</label>
          <input
            type="datetime-local"
            className="input-field"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-600 mb-1">Napomena (opcionalno)</label>
          <input
            className="input-field"
            placeholder="Kratka napomena..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Dodajem...' : '+ Dodaj događaj'}
      </button>
    </form>
  );
}
