'use client';

import { useState } from 'react';

export function ImportCostCalculator() {
  const [productCost, setProductCost] = useState('');
  const [freightEstimate, setFreightEstimate] = useState('');
  const [customsPct, setCustomsPct] = useState('10');

  const product = parseFloat(productCost) || 0;
  const freight = parseFloat(freightEstimate) || 0;
  const pct = parseFloat(customsPct) || 0;

  const customsDuty = product * (pct / 100);
  const vat = (product + freight + customsDuty) * 0.17;
  const total = product + freight + customsDuty + vat;

  const fmt = (n: number) =>
    n > 0
      ? n.toLocaleString('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
      : '—';

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Cijena robe (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            placeholder="npr. 5000"
            value={productCost}
            onChange={(e) => setProductCost(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Procjena transporta (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            placeholder="npr. 1200"
            value={freightEstimate}
            onChange={(e) => setFreightEstimate(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Carinska stopa (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            className="input-field"
            value={customsPct}
            onChange={(e) => setCustomsPct(e.target.value)}
          />
        </div>
      </div>

      {total > 0 && (
        <div className="rounded-xl bg-ink-50 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-ink-700">Procijenjeni troškovi</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-ink-500">Cijena robe</span>
            <span className="font-medium text-ink-900 text-right">{fmt(product)}</span>
            <span className="text-ink-500">Transport</span>
            <span className="font-medium text-ink-900 text-right">{fmt(freight)}</span>
            <span className="text-ink-500">Carina ({customsPct}%)</span>
            <span className="font-medium text-ink-900 text-right">{fmt(customsDuty)}</span>
            <span className="text-ink-500">PDV 17%</span>
            <span className="font-medium text-ink-900 text-right">{fmt(vat)}</span>
            <span className="font-semibold text-ink-900 pt-2 border-t border-ink-200">Ukupno (landed cost)</span>
            <span className="font-bold text-brand-700 text-right pt-2 border-t border-ink-200 text-base">{fmt(total)}</span>
          </div>
        </div>
      )}

      <p className="text-xs text-ink-400 italic">
        * Ovo je samo procjena za orijentaciju. Tačna cijena se potvrđuje tek nakon detaljne analize vašeg zahtjeva — carinska stopa, transport i naša naknada zavise od konkretne robe i uvjeta.
      </p>
    </div>
  );
}
