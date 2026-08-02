'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  importRequestId: string;
  defaultOriginCity?: string;
  defaultDestinationCity?: string;
  defaultWeightKg?: string;
  defaultVolumeCbm?: string;
}

interface FormData {
  cargoDescription: string;
  quantity: string;
  weightKg: string;
  volumeCbm: string;
  originCity: string;
  destinationCity: string;
  readyDate: string;
  requestedModes: string[];
  requiresPickupChina: boolean;
  requiresExportCustoms: boolean;
  requiresFreight: boolean;
  requiresEuTransit: boolean;
  requiresBihCustoms: boolean;
  requiresDelivery: boolean;
}

const MODE_OPTIONS = [
  { value: 'SEA', label: 'More' },
  { value: 'RAIL', label: 'Željeznica' },
  { value: 'AIR', label: 'Zrak' },
  { value: 'ROAD', label: 'Cestovni' },
];

const SERVICE_CHECKBOXES: { field: keyof FormData; label: string }[] = [
  { field: 'requiresPickupChina', label: 'Pickup u Kini' },
  { field: 'requiresExportCustoms', label: 'Izvozna carina (Kina)' },
  { field: 'requiresFreight', label: 'Freight (transport)' },
  { field: 'requiresEuTransit', label: 'EU tranzit' },
  { field: 'requiresBihCustoms', label: 'Uvozna carina BiH' },
  { field: 'requiresDelivery', label: 'Dostava do adrese' },
];

export function TransportRequestForm({
  importRequestId,
  defaultOriginCity,
  defaultDestinationCity,
  defaultWeightKg,
  defaultVolumeCbm,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    cargoDescription: '',
    quantity: '',
    weightKg: defaultWeightKg ?? '',
    volumeCbm: defaultVolumeCbm ?? '',
    originCity: defaultOriginCity ?? '',
    destinationCity: defaultDestinationCity ?? '',
    readyDate: '',
    requestedModes: [],
    requiresPickupChina: false,
    requiresExportCustoms: false,
    requiresFreight: true,
    requiresEuTransit: false,
    requiresBihCustoms: false,
    requiresDelivery: false,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMode(mode: string) {
    setForm((prev) => ({
      ...prev,
      requestedModes: prev.requestedModes.includes(mode)
        ? prev.requestedModes.filter((m) => m !== mode)
        : [...prev.requestedModes, mode],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      importRequestId,
      cargoDescription: form.cargoDescription || null,
      quantity: form.quantity ? parseInt(form.quantity, 10) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      volumeCbm: form.volumeCbm ? parseFloat(form.volumeCbm) : null,
      originCity: form.originCity || null,
      destinationCity: form.destinationCity || null,
      readyDate: form.readyDate || null,
      requestedModes: form.requestedModes,
      requiresPickupChina: form.requiresPickupChina,
      requiresExportCustoms: form.requiresExportCustoms,
      requiresFreight: form.requiresFreight,
      requiresEuTransit: form.requiresEuTransit,
      requiresBihCustoms: form.requiresBihCustoms,
      requiresDelivery: form.requiresDelivery,
    };

    const res = await fetch('/api/transport-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Došlo je do greške.');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Opis robe</label>
        <textarea
          rows={2}
          className="input-field"
          placeholder="npr. 500 kom plastičnih kutija za pakovanje..."
          value={form.cargoDescription}
          onChange={(e) => setField('cargoDescription', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Količina</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={form.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Težina (kg)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            value={form.weightKg}
            onChange={(e) => setField('weightKg', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Volumen (CBM)</label>
          <input
            type="number"
            min="0"
            step="0.001"
            className="input-field"
            value={form.volumeCbm}
            onChange={(e) => setField('volumeCbm', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Grad polaska</label>
          <input
            className="input-field"
            placeholder="npr. Shanghai"
            value={form.originCity}
            onChange={(e) => setField('originCity', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Grad odredišta</label>
          <input
            className="input-field"
            placeholder="npr. Sarajevo"
            value={form.destinationCity}
            onChange={(e) => setField('destinationCity', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Datum spremnosti</label>
          <input
            type="date"
            className="input-field"
            value={form.readyDate}
            onChange={(e) => setField('readyDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-ink-700 mb-2">Traženi načini transporta</p>
        <div className="flex gap-3 flex-wrap">
          {MODE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.requestedModes.includes(value)}
                onChange={() => toggleMode(value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-ink-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="block text-sm font-medium text-ink-700 mb-2">Tražene usluge</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_CHECKBOXES.map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[field] as boolean}
                onChange={(e) => setField(field, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-ink-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Kreiram...' : 'Kreiraj transport upit'}
      </button>
    </form>
  );
}
