'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  importRequestId: string;
}

export function MessageForm({ importRequestId }: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError('');

    const res = await fetch(`/api/requests/${importRequestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    });

    setSending(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri slanju poruke.');
      return;
    }

    setBody('');
    router.refresh();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 items-end">
        <textarea
          rows={2}
          className="input-field flex-1 resize-none"
          placeholder="Napišite poruku... (Enter za slanje, Shift+Enter za novi red)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="btn-primary shrink-0"
          disabled={sending || !body.trim()}
        >
          {sending ? '...' : 'Pošalji'}
        </button>
      </div>
    </form>
  );
}
