'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IMPORT_STATUS_LABELS } from '@/lib/status';

const ALL_STATUSES = [
  'NEW',
  'UNDER_REVIEW',
  'SOURCING',
  'SUPPLIER_SELECTED',
  'NEGOTIATION',
  'QUALITY_CONTROL',
  'TRANSPORT_QUOTATION',
  'CLIENT_APPROVAL',
  'ORDER_CONFIRMED',
  'GOODS_READY',
  'IN_TRANSIT',
  'CUSTOMS',
  'DELIVERY',
  'COMPLETED',
  'REQUIRES_ASSESSMENT',
] as const;

export function StatusChangeForm({
  importRequestId,
  currentStatus,
}: {
  importRequestId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch(`/api/requests/${importRequestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note: note.trim() || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri promjeni statusa.');
      return;
    }

    setNote('');
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 border-t border-ink-100 pt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
        Promijeni status
      </p>

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setSuccess(false);
        }}
        className="input-field text-sm"
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {IMPORT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="input-field min-h-[60px] resize-y text-sm"
        placeholder="Zašto mijenjate status? (opciono)"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && (
        <p className="text-xs text-emerald-600">Status uspješno promijenjen.</p>
      )}

      <button
        type="submit"
        className="btn-primary w-full text-sm"
        disabled={loading || status === currentStatus}
      >
        {loading ? 'Čuvanje…' : 'Sačuvaj status'}
      </button>
    </form>
  );
}
