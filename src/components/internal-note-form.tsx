'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function InternalNoteForm({ importRequestId }: { importRequestId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/requests/${importRequestId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri dodavanju bilješke.');
      return;
    }

    setBody('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="input-field min-h-[80px] resize-y text-sm"
        placeholder="Napišite internu bilješku (vidljivo samo staff-u)..."
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        className="btn-primary text-sm"
        disabled={loading || !body.trim()}
      >
        {loading ? 'Dodavanje…' : 'Dodaj bilješku'}
      </button>
    </form>
  );
}
