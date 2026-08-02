'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Supplier {
  id: string;
  companyName: string;
  status: string;
}

interface Props {
  importRequestId: string;
  suppliers: Supplier[];
  currentSupplierId?: string | null;
}

export function SupplierAssignForm({ importRequestId, suppliers, currentSupplierId }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function callApi(supplierId: string | null): Promise<boolean> {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/requests/${importRequestId}/assign-supplier`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { message?: string }).message ?? 'Greška pri promjeni dobavljača.');
      return false;
    }
    return true;
  }

  // Supplier IS assigned → show only "Promijeni" button
  if (currentSupplierId) {
    return (
      <div className="flex items-center gap-3 border-t border-ink-100 mt-4 pt-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          onClick={async () => {
            const ok = await callApi(null);
            if (ok) router.refresh();
          }}
          className="btn-secondary text-sm"
          disabled={saving}
        >
          {saving ? 'Čuvam...' : 'Promijeni dobavljača'}
        </button>
      </div>
    );
  }

  // No supplier assigned → show dropdown + assign + new supplier link
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    const ok = await callApi(selectedId);
    if (ok) router.refresh();
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-ink-500 italic">Nema dobavljača u sistemu.</p>
        <Link href="/admin/suppliers/new" target="_blank" className="btn-primary text-sm">
          + Kreiraj dobavljača
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
      <div className="min-w-48 flex-1">
        <label className="mb-1 block text-xs font-medium text-ink-600">Odaberi dobavljača</label>
        <select
          className="input-field"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
        >
          <option value="">— Odaberi —</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.companyName}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary" disabled={saving || !selectedId}>
        {saving ? 'Čuvam...' : 'Dodijeli dobavljača'}
      </button>
      <Link href="/admin/suppliers/new" target="_blank" className="btn-secondary">
        + Novi dobavljač
      </Link>
    </form>
  );
}
