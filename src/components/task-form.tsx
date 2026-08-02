'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Nizak' },
  { value: 'MEDIUM', label: 'Srednji' },
  { value: 'HIGH', label: 'Visok' },
  { value: 'URGENT', label: 'Hitan' },
];

export function TaskForm({ importRequestId }: { importRequestId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Naslov taska je obavezan.');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/requests/${importRequestId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        deadline: deadline || undefined,
        priority,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri dodavanju taska.');
      return;
    }

    setTitle('');
    setDeadline('');
    setPriority('MEDIUM');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <input
          className="input-field min-w-0 flex-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Naslov taska..."
        />
        <input
          type="date"
          className="input-field w-40 shrink-0"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          title="Rok (opciono)"
        />
        <select
          className="input-field w-36 shrink-0"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button type="submit" className="btn-primary text-sm" disabled={loading}>
        {loading ? 'Dodavanje…' : '+ Dodaj task'}
      </button>
    </form>
  );
}
