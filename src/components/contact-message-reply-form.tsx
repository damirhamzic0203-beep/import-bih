'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  messageId: string;
  existingReply: string | null;
  currentStatus: string;
}

export function ContactMessageReplyForm({ messageId, existingReply, currentStatus }: Props) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply ?? '');
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleReply() {
    if (!reply.trim()) {
      setError('Unesite tekst odgovora.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/contact-messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', reply: reply.trim() }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri slanju odgovora.');
      return;
    }
    setSuccess('Odgovor je uspješno poslan klijentu putem emaila.');
    router.refresh();
  }

  async function handleArchive() {
    setArchiving(true);
    setError(null);
    setSuccess(null);

    const res = await fetch(`/api/contact-messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'archive' }),
    });

    setArchiving(false);
    if (!res.ok) {
      setError('Greška pri arhiviranju poruke.');
      return;
    }
    router.push('/admin/contact-messages');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          {existingReply ? 'Izmijeni odgovor' : 'Napišite odgovor klijentu'}
        </label>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          rows={6}
          placeholder="Vaš odgovor klijentu..."
          className="input-field resize-y"
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={handleReply} disabled={saving} className="btn-primary">
          {saving ? 'Slanje...' : 'Pošalji odgovor'}
        </button>
        {currentStatus !== 'ARHIVIRANO' && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={archiving}
            className="text-sm text-ink-500 hover:text-ink-900 disabled:opacity-50"
          >
            {archiving ? 'Arhiviranje...' : 'Arhiviraj'}
          </button>
        )}
      </div>
    </div>
  );
}
