'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TRANSPORT_MODES = [
  { value: 'SEA', label: 'More' },
  { value: 'RAIL', label: 'Željeznica' },
  { value: 'AIR', label: 'Avion' },
  { value: 'ROAD', label: 'Kamion' },
];

interface DefaultValues {
  carrier?: string;
  containerNumber?: string;
  blNumber?: string;
  trackingNumber?: string;
  origin?: string;
  destination?: string;
  etd?: string;
  eta?: string;
  transportMode?: string;
  currentLocation?: string;
  actualDeparture?: string;
  actualArrival?: string;
}

interface Props {
  importRequestId?: string;
  shipmentId?: string;
  defaultValues?: DefaultValues;
}

export function ShipmentForm({ importRequestId, shipmentId, defaultValues }: Props) {
  const router = useRouter();
  const isEditing = !!shipmentId;

  const [form, setForm] = useState({
    carrier: defaultValues?.carrier ?? '',
    containerNumber: defaultValues?.containerNumber ?? '',
    blNumber: defaultValues?.blNumber ?? '',
    trackingNumber: defaultValues?.trackingNumber ?? '',
    origin: defaultValues?.origin ?? '',
    destination: defaultValues?.destination ?? '',
    etd: defaultValues?.etd ?? '',
    eta: defaultValues?.eta ?? '',
    transportMode: defaultValues?.transportMode ?? '',
    currentLocation: defaultValues?.currentLocation ?? '',
    actualDeparture: defaultValues?.actualDeparture ?? '',
    actualArrival: defaultValues?.actualArrival ?? '',
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

    const url = isEditing
      ? `/api/shipments/${shipmentId}`
      : `/api/requests/${importRequestId}/shipment`;

    const body: Record<string, string | null> = {
      carrier: form.carrier || null,
      containerNumber: form.containerNumber || null,
      blNumber: form.blNumber || null,
      trackingNumber: form.trackingNumber || null,
      origin: form.origin || null,
      destination: form.destination || null,
      etd: form.etd || null,
      eta: form.eta || null,
      transportMode: form.transportMode || null,
    };

    if (isEditing) {
      body.currentLocation = form.currentLocation || null;
      body.actualDeparture = form.actualDeparture || null;
      body.actualArrival = form.actualArrival || null;
    }

    const res = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri čuvanju pošiljke.');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Prijevoznik</label>
          <input
            className="input-field"
            value={form.carrier}
            onChange={(e) => set('carrier', e.target.value)}
            placeholder="npr. COSCO, DHL..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Način transporta</label>
          <select
            className="input-field"
            value={form.transportMode}
            onChange={(e) => set('transportMode', e.target.value)}
          >
            <option value="">— Odaberite —</option>
            {TRANSPORT_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Broj kontejnera</label>
          <input
            className="input-field"
            value={form.containerNumber}
            onChange={(e) => set('containerNumber', e.target.value)}
            placeholder="CSQU3054383"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">B/L broj</label>
          <input
            className="input-field"
            value={form.blNumber}
            onChange={(e) => set('blNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Tracking broj</label>
          <input
            className="input-field"
            value={form.trackingNumber}
            onChange={(e) => set('trackingNumber', e.target.value)}
          />
        </div>
        <div />
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Polazna luka / grad</label>
          <input
            className="input-field"
            value={form.origin}
            onChange={(e) => set('origin', e.target.value)}
            placeholder="Shanghai"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Odredišna luka / grad</label>
          <input
            className="input-field"
            value={form.destination}
            onChange={(e) => set('destination', e.target.value)}
            placeholder="Rijeka"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">ETD (planirani polazak)</label>
          <input
            type="date"
            className="input-field"
            value={form.etd}
            onChange={(e) => set('etd', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">ETA (planirani dolazak)</label>
          <input
            type="date"
            className="input-field"
            value={form.eta}
            onChange={(e) => set('eta', e.target.value)}
          />
        </div>

        {isEditing && (
          <>
            <div className="sm:col-span-2 border-t border-ink-100 pt-3">
              <p className="text-sm font-medium text-ink-700">Ažuriranja u realnom vremenu</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Trenutna lokacija</label>
              <input
                className="input-field"
                value={form.currentLocation}
                onChange={(e) => set('currentLocation', e.target.value)}
                placeholder="npr. Port of Rotterdam"
              />
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Stvarni polazak</label>
              <input
                type="date"
                className="input-field"
                value={form.actualDeparture}
                onChange={(e) => set('actualDeparture', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Stvarni dolazak</label>
              <input
                type="date"
                className="input-field"
                value={form.actualArrival}
                onChange={(e) => set('actualArrival', e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Čuvam...' : isEditing ? 'Sačuvaj izmjene' : 'Kreiraj pošiljku'}
      </button>
    </form>
  );
}
