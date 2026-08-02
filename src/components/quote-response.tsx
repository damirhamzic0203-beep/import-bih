'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  quoteId: string;
}

type Action = 'accept' | 'request_changes' | 'decline';

export function QuoteResponse({ quoteId }: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(action: Action) {
    setSaving(true);
    setError('');

    const res = await fetch(`/api/quotes/${quoteId}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note: note || null }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri odgovoru na ponudu.');
      return;
    }

    setPendingAction(null);
    setNote('');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!pendingAction && (
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-primary"
            style={{ backgroundColor: '#16a34a' }}
            disabled={saving}
            onClick={() => submit('accept')}
          >
            ✓ Prihvati ponudu
          </button>
          <button
            className="btn-secondary"
            disabled={saving}
            onClick={() => setPendingAction('request_changes')}
          >
            ✎ Zatraži izmjene
          </button>
          <button
            className="btn-secondary"
            style={{ color: '#dc2626', borderColor: '#fecaca' }}
            disabled={saving}
            onClick={() => setPendingAction('decline')}
          >
            ✗ Odbij ponudu
          </button>
        </div>
      )}

      {pendingAction === 'request_changes' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-medium text-amber-800">Koje izmjene trebate?</p>
          <textarea
            rows={3}
            className="input-field"
            placeholder="Opišite tražene izmjene..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              className="btn-primary"
              disabled={saving}
              onClick={() => submit('request_changes')}
            >
              {saving ? 'Šaljem...' : 'Pošalji zahtjev za izmjene'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => { setPendingAction(null); setNote(''); }}
            >
              Odustani
            </button>
          </div>
        </div>
      )}

      {pendingAction === 'decline' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">
            Jeste li sigurni da odbijate ovu ponudu?
          </p>
          <div className="flex gap-2">
            <button
              className="btn-primary"
              style={{ backgroundColor: '#dc2626' }}
              disabled={saving}
              onClick={() => submit('decline')}
            >
              {saving ? 'Šaljem...' : 'Da, odbijam ponudu'}
            </button>
            <button className="btn-secondary" onClick={() => setPendingAction(null)}>
              Odustani
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
