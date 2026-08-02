'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/status';

interface Quote {
  id: string;
  forwarderName: string;
  freightCost: string | null;
  customsCost: string | null;
  deliveryCost: string | null;
  totalCost: string | null;
  transitDays: number | null;
  validUntil: string | null;
  isRecommended: boolean;
  recommendReason: string | null;
  isSelected: boolean;
  currency: string;
}

interface Props {
  quotes: Quote[];
}

export function ForwarderQuotesTable({ quotes }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftReason, setDraftReason] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  async function patch(id: string, body: object) {
    setSaving(id);
    await fetch(`/api/forwarder-quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(null);
    router.refresh();
  }

  function handleRecommendClick(q: Quote) {
    if (q.isRecommended) {
      patch(q.id, { isRecommended: false, recommendReason: null });
    } else {
      setDraftReason(q.recommendReason ?? '');
      setExpandedId(q.id);
    }
  }

  async function saveRecommend(id: string) {
    await patch(id, { isRecommended: true, recommendReason: draftReason || null });
    setExpandedId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 border-b border-ink-200">
          <tr>
            <th className="text-left px-3 py-2 font-medium text-ink-600">Transporter</th>
            <th className="text-right px-3 py-2 font-medium text-ink-600">Freight</th>
            <th className="text-right px-3 py-2 font-medium text-ink-600">Carina</th>
            <th className="text-right px-3 py-2 font-medium text-ink-600">Dostava</th>
            <th className="text-right px-3 py-2 font-medium text-ink-600">Ukupno</th>
            <th className="text-center px-3 py-2 font-medium text-ink-600">Rok (dana)</th>
            <th className="text-center px-3 py-2 font-medium text-ink-600">Vrijedi do</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {quotes.flatMap((q) => {
            const rows = [
              <tr
                key={q.id}
                className={`transition-colors ${
                  q.isSelected ? 'bg-emerald-50' : 'hover:bg-ink-50'
                }`}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {q.isRecommended && (
                      <span title={q.recommendReason ?? 'Preporučena ponuda'}>⭐</span>
                    )}
                    <span
                      className={
                        q.isSelected ? 'font-semibold text-emerald-800' : 'text-ink-900'
                      }
                    >
                      {q.forwarderName}
                    </span>
                    {q.isSelected && (
                      <span className="badge bg-emerald-600 text-white text-xs">Odabrana</span>
                    )}
                  </div>
                  {q.isRecommended && q.recommendReason && (
                    <p className="mt-1 text-xs text-ink-400 italic">{q.recommendReason}</p>
                  )}
                </td>
                <td className="px-3 py-3 text-right text-ink-700">
                  {q.freightCost ? formatCurrency(q.freightCost, q.currency) : '—'}
                </td>
                <td className="px-3 py-3 text-right text-ink-700">
                  {q.customsCost ? formatCurrency(q.customsCost, q.currency) : '—'}
                </td>
                <td className="px-3 py-3 text-right text-ink-700">
                  {q.deliveryCost ? formatCurrency(q.deliveryCost, q.currency) : '—'}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-ink-900">
                  {q.totalCost ? formatCurrency(q.totalCost, q.currency) : '—'}
                </td>
                <td className="px-3 py-3 text-center text-ink-700">
                  {q.transitDays !== null ? `${q.transitDays}` : '—'}
                </td>
                <td className="px-3 py-3 text-center text-ink-700">
                  {q.validUntil
                    ? new Date(q.validUntil).toLocaleDateString('bs-BA')
                    : '—'}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1.5 items-end">
                    <button
                      className="btn-secondary py-1 px-2 text-xs whitespace-nowrap"
                      disabled={saving === q.id}
                      onClick={() => handleRecommendClick(q)}
                    >
                      {q.isRecommended ? '★ Ukloni preporuku' : '☆ Preporuči'}
                    </button>
                    {!q.isSelected ? (
                      <button
                        className="btn-primary py-1 px-2 text-xs whitespace-nowrap"
                        disabled={saving === q.id}
                        onClick={() => patch(q.id, { isSelected: true })}
                      >
                        Odaberi
                      </button>
                    ) : (
                      <button
                        className="btn-secondary py-1 px-2 text-xs whitespace-nowrap"
                        disabled={saving === q.id}
                        onClick={() => patch(q.id, { isSelected: false })}
                      >
                        Poništi odabir
                      </button>
                    )}
                  </div>
                </td>
              </tr>,
            ];

            if (expandedId === q.id) {
              rows.push(
                <tr key={`${q.id}-reason`} className="bg-amber-50">
                  <td colSpan={8} className="px-3 py-3">
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-ink-700 mb-1">
                          Razlog preporuke
                        </label>
                        <input
                          className="input-field text-sm"
                          placeholder="npr. Najniža cijena, provjeren partner..."
                          value={draftReason}
                          onChange={(e) => setDraftReason(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <button
                        className="btn-primary text-sm"
                        disabled={saving === q.id}
                        onClick={() => saveRecommend(q.id)}
                      >
                        Sačuvaj
                      </button>
                      <button
                        className="btn-secondary text-sm"
                        onClick={() => setExpandedId(null)}
                      >
                        Odustani
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            return rows;
          })}
        </tbody>
      </table>
    </div>
  );
}
