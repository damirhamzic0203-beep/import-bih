'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ForwarderOption {
  id: string;
  companyName: string;
  supportsSea: boolean;
  supportsRail: boolean;
  supportsAir: boolean;
  supportsRoad: boolean;
}

interface Props {
  transportRequestId: string;
  requestedModes: string[];
  forwarders: ForwarderOption[];
  alreadySentIds: string[];
}

function isMatchingForwarder(f: ForwarderOption, modes: string[]): boolean {
  return modes.some((m) => {
    if (m === 'SEA') return f.supportsSea;
    if (m === 'RAIL') return f.supportsRail;
    if (m === 'AIR') return f.supportsAir;
    if (m === 'ROAD') return f.supportsRoad;
    return false;
  });
}

export function ForwarderSelect({
  transportRequestId,
  requestedModes,
  forwarders,
  alreadySentIds,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [lastSentCount, setLastSentCount] = useState<number | null>(null);

  function toggleForwarder(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSend() {
    if (selected.length === 0) return;
    setSending(true);
    setError('');
    setLastSentCount(null);

    const res = await fetch(`/api/transport-requests/${transportRequestId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forwarderIds: selected }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.message ?? 'Greška pri slanju.');
      return;
    }

    setLastSentCount(data.sentCount ?? selected.length);
    setSelected([]);
    router.refresh();
  }

  const sortedForwarders = [...forwarders].sort((a, b) => {
    const aMatch = isMatchingForwarder(a, requestedModes) ? 0 : 1;
    const bMatch = isMatchingForwarder(b, requestedModes) ? 0 : 1;
    return aMatch - bMatch || a.companyName.localeCompare(b.companyName);
  });

  const newForwarders = sortedForwarders.filter((f) => !alreadySentIds.includes(f.id));

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink-700">Pošalji upit transporterima</p>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {lastSentCount !== null && (
        <p className="text-emerald-700 text-sm">
          ✓ Upit poslan {lastSentCount} {lastSentCount === 1 ? 'transporteru' : 'transportera'}
        </p>
      )}

      {newForwarders.length === 0 ? (
        <p className="text-sm text-ink-400">Svi transporteri su već obaviješteni.</p>
      ) : (
        <div className="divide-y divide-ink-100 border border-ink-200 rounded-lg overflow-hidden">
          {newForwarders.map((f) => {
            const matching = isMatchingForwarder(f, requestedModes);
            return (
              <label
                key={f.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                  ${selected.includes(f.id) ? 'bg-brand-50' : 'bg-white hover:bg-ink-50'}
                `}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(f.id)}
                  onChange={() => toggleForwarder(f.id)}
                  className="w-4 h-4 shrink-0"
                />
                <span className="flex-1 text-sm text-ink-900">{f.companyName}</span>
                {matching && requestedModes.length > 0 && (
                  <span className="badge bg-emerald-100 text-emerald-700 text-xs shrink-0">
                    Podržava tražene načine
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {newForwarders.length > 0 && (
        <button
          className="btn-primary"
          disabled={selected.length === 0 || sending}
          onClick={handleSend}
        >
          {sending
            ? 'Šaljem...'
            : `Pošalji upit odabranim (${selected.length})`}
        </button>
      )}
    </div>
  );
}
