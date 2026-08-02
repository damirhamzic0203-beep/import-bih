'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function QuoteSendButton({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    setSending(true);
    setError('');

    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send' }),
    });

    setSending(false);

    if (!res.ok) {
      setError('Greška pri slanju ponude klijentu.');
      return;
    }

    router.refresh();
  }

  return (
    <div>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button className="btn-primary" onClick={handleSend} disabled={sending}>
        {sending ? 'Šaljem...' : '→ Pošalji klijentu'}
      </button>
    </div>
  );
}
