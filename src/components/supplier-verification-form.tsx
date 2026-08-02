'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPLIER_STATUS_LABELS } from '@/lib/status';

interface Props {
  supplierId: string;
  currentStatus: string;
  currentScore: number | null;
}

export function SupplierVerificationForm({ supplierId, currentStatus, currentScore }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [score, setScore] = useState(currentScore?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/suppliers/${supplierId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        verificationScore: score ? parseInt(score, 10) : null,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Greška pri ažuriranju.');
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Status</label>
        <select
          className="input-field"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {Object.entries(SUPPLIER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          Verifikacijski skor (0–100)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          className="input-field"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="npr. 75"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? 'Čuvam...' : 'Ažuriraj status'}
      </button>
    </form>
  );
}
