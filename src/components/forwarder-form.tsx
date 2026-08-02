'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForwarderFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  originCities: string;
  destinationCountries: string;
  supportsSea: boolean;
  supportsRail: boolean;
  supportsAir: boolean;
  supportsRoad: boolean;
  supportsLcl: boolean;
  supportsFcl: boolean;
  supportsDoorToDoor: boolean;
  supportsCustoms: boolean;
  supportsWarehouse: boolean;
  pricingNotes: string;
  transitTimeNote: string;
  internalNotes: string;
  rating: string;
}

interface Props {
  forwarderId?: string;
  initialData?: Partial<ForwarderFormData>;
}

export function ForwarderForm({ forwarderId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ForwarderFormData>({
    companyName: initialData?.companyName ?? '',
    contactPerson: initialData?.contactPerson ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    website: initialData?.website ?? '',
    originCities: initialData?.originCities ?? '',
    destinationCountries: initialData?.destinationCountries ?? '',
    supportsSea: initialData?.supportsSea ?? false,
    supportsRail: initialData?.supportsRail ?? false,
    supportsAir: initialData?.supportsAir ?? false,
    supportsRoad: initialData?.supportsRoad ?? false,
    supportsLcl: initialData?.supportsLcl ?? false,
    supportsFcl: initialData?.supportsFcl ?? false,
    supportsDoorToDoor: initialData?.supportsDoorToDoor ?? false,
    supportsCustoms: initialData?.supportsCustoms ?? false,
    supportsWarehouse: initialData?.supportsWarehouse ?? false,
    pricingNotes: initialData?.pricingNotes ?? '',
    transitTimeNote: initialData?.transitTimeNote ?? '',
    internalNotes: initialData?.internalNotes ?? '',
    rating: initialData?.rating ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ForwarderFormData>(field: K, value: ForwarderFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {
      companyName: form.companyName,
      contactPerson: form.contactPerson || null,
      email: form.email || null,
      phone: form.phone || null,
      website: form.website || null,
      originCities: form.originCities
        ? form.originCities.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      destinationCountries: form.destinationCountries
        ? form.destinationCountries.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      supportsSea: form.supportsSea,
      supportsRail: form.supportsRail,
      supportsAir: form.supportsAir,
      supportsRoad: form.supportsRoad,
      supportsLcl: form.supportsLcl,
      supportsFcl: form.supportsFcl,
      supportsDoorToDoor: form.supportsDoorToDoor,
      supportsCustoms: form.supportsCustoms,
      supportsWarehouse: form.supportsWarehouse,
      pricingNotes: form.pricingNotes || null,
      transitTimeNote: form.transitTimeNote || null,
      internalNotes: form.internalNotes || null,
      rating: form.rating ? parseInt(form.rating, 10) : null,
    };

    const url = forwarderId ? `/api/forwarders/${forwarderId}` : '/api/forwarders';
    const method = forwarderId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Došlo je do greške.');
      return;
    }

    if (forwarderId) {
      router.refresh();
      router.push(`/admin/forwarders/${forwarderId}`);
    } else {
      router.push(`/admin/forwarders/${data.id}`);
    }
  }

  const checkboxes: { field: keyof ForwarderFormData; label: string }[] = [
    { field: 'supportsSea', label: 'More' },
    { field: 'supportsRail', label: 'Željeznica' },
    { field: 'supportsAir', label: 'Zrak' },
    { field: 'supportsRoad', label: 'Cestovni' },
    { field: 'supportsLcl', label: 'LCL' },
    { field: 'supportsFcl', label: 'FCL' },
    { field: 'supportsDoorToDoor', label: 'Door to Door' },
    { field: 'supportsCustoms', label: 'Carina' },
    { field: 'supportsWarehouse', label: 'Skladište' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Kontakt</h2>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Naziv firme <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            value={form.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Kontakt osoba</label>
            <input
              className="input-field"
              value={form.contactPerson}
              onChange={(e) => set('contactPerson', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Telefon</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Website</label>
            <input
              className="input-field"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Rute</h2>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Gradovi polaska <span className="text-ink-400 font-normal">(odvojite zarezom)</span>
          </label>
          <input
            className="input-field"
            placeholder="npr. Shanghai, Guangzhou, Shenzhen"
            value={form.originCities}
            onChange={(e) => set('originCities', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Odredišne države <span className="text-ink-400 font-normal">(odvojite zarezom)</span>
          </label>
          <input
            className="input-field"
            placeholder="npr. Bosnia, Serbia, Croatia"
            value={form.destinationCountries}
            onChange={(e) => set('destinationCountries', e.target.value)}
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Vrste transporta i usluge</h2>
        <div className="grid grid-cols-3 gap-3">
          {checkboxes.map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[field] as boolean}
                onChange={(e) => set(field, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-ink-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Napomene i ocjena</h2>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Napomene o cijenama</label>
          <textarea
            rows={3}
            className="input-field"
            value={form.pricingNotes}
            onChange={(e) => set('pricingNotes', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Napomena o tranzitnom vremenu</label>
          <textarea
            rows={2}
            className="input-field"
            value={form.transitTimeNote}
            onChange={(e) => set('transitTimeNote', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Interne napomene</label>
          <textarea
            rows={3}
            className="input-field"
            value={form.internalNotes}
            onChange={(e) => set('internalNotes', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Ocjena (1–5)</label>
          <select
            className="input-field w-40"
            value={form.rating}
            onChange={(e) => set('rating', e.target.value)}
          >
            <option value="">Bez ocjene</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Čuvam...' : forwarderId ? 'Sačuvaj izmjene' : 'Kreiraj transportera'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
          disabled={saving}
        >
          Odustani
        </button>
      </div>
    </form>
  );
}
