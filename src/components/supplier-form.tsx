'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SupplierFormData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  wechat: string;
  website: string;
  alibabaUrl: string;
  url1688: string;
  country: string;
  city: string;
  isFactory: boolean;
  categories: string;
  moq: string;
  rating: string;
  notes: string;
}

interface Props {
  supplierId?: string;
  initialData?: Partial<SupplierFormData>;
}

export function SupplierForm({ supplierId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SupplierFormData>({
    companyName: initialData?.companyName ?? '',
    contactPerson: initialData?.contactPerson ?? '',
    phone: initialData?.phone ?? '',
    email: initialData?.email ?? '',
    wechat: initialData?.wechat ?? '',
    website: initialData?.website ?? '',
    alibabaUrl: initialData?.alibabaUrl ?? '',
    url1688: initialData?.url1688 ?? '',
    country: initialData?.country ?? 'China',
    city: initialData?.city ?? '',
    isFactory: initialData?.isFactory ?? false,
    categories: initialData?.categories ?? '',
    moq: initialData?.moq ?? '',
    rating: initialData?.rating ?? '',
    notes: initialData?.notes ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof SupplierFormData>(field: K, value: SupplierFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {
      companyName: form.companyName,
      contactPerson: form.contactPerson || null,
      phone: form.phone || null,
      email: form.email || null,
      wechat: form.wechat || null,
      website: form.website || null,
      alibabaUrl: form.alibabaUrl || null,
      url1688: form.url1688 || null,
      country: form.country || 'China',
      city: form.city || null,
      isFactory: form.isFactory,
      categories: form.categories
        ? form.categories.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      moq: form.moq ? parseInt(form.moq, 10) : null,
      rating: form.rating ? parseInt(form.rating, 10) : null,
      notes: form.notes || null,
    };

    const url = supplierId ? `/api/suppliers/${supplierId}` : '/api/suppliers';
    const method = supplierId ? 'PATCH' : 'POST';

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

    if (supplierId) {
      router.refresh();
      router.push(`/admin/suppliers/${supplierId}`);
    } else {
      router.push(`/admin/suppliers/${data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Osnovno</h2>

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
            <label className="block text-sm font-medium text-ink-700 mb-1">Telefon</label>
            <input
              className="input-field"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">WeChat</label>
            <input
              className="input-field"
              value={form.wechat}
              onChange={(e) => set('wechat', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Website</label>
            <input
              className="input-field"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Alibaba URL</label>
            <input
              className="input-field"
              value={form.alibabaUrl}
              onChange={(e) => set('alibabaUrl', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">1688 URL</label>
          <input
            className="input-field"
            value={form.url1688}
            onChange={(e) => set('url1688', e.target.value)}
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Lokacija i tip</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Država</label>
            <input
              className="input-field"
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Grad</label>
            <input
              className="input-field"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFactory}
            onChange={(e) => set('isFactory', e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-ink-700">Fabrika (nije trader)</span>
        </label>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-ink-900">Kategorije i detalji</h2>

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Kategorije <span className="text-ink-400 font-normal">(odvojite zarezom)</span>
          </label>
          <input
            className="input-field"
            placeholder="npr. Elektronika, Tekstil, Igračke"
            value={form.categories}
            onChange={(e) => set('categories', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">MOQ (min. narudžba)</label>
            <input
              type="number"
              min="1"
              className="input-field"
              value={form.moq}
              onChange={(e) => set('moq', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Ocjena (1–5)</label>
            <select
              className="input-field"
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

        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Napomene</label>
          <textarea
            rows={4}
            className="input-field"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Čuvam...' : supplierId ? 'Sačuvaj izmjene' : 'Kreiraj dobavljača'}
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
