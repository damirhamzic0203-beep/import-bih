'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CURRENCIES = ['EUR', 'BAM', 'USD', 'CNY'];

interface DefaultValues {
  productCost?: string;
  logisticsCost?: string;
  customsCost?: string;
  deliveryCost?: string;
  serviceCost?: string;
  vatAmount?: string;
  internalCost?: string;
  currency?: string;
  validUntil?: string;
}

interface Props {
  importRequestId?: string;
  quoteId?: string;
  existingStatus?: string;
  defaultValues?: DefaultValues;
}

interface FormData {
  productCost: string;
  logisticsCost: string;
  customsCost: string;
  deliveryCost: string;
  serviceCost: string;
  vatAmount: string;
  internalCost: string;
  currency: string;
  validUntil: string;
  changeNote: string;
}

function n(v: string): number {
  const p = parseFloat(v);
  return isNaN(p) ? 0 : p;
}

export function QuoteForm({ importRequestId, quoteId, existingStatus, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    productCost: defaultValues?.productCost ?? '',
    logisticsCost: defaultValues?.logisticsCost ?? '',
    customsCost: defaultValues?.customsCost ?? '',
    deliveryCost: defaultValues?.deliveryCost ?? '',
    serviceCost: defaultValues?.serviceCost ?? '',
    vatAmount: defaultValues?.vatAmount ?? '',
    internalCost: defaultValues?.internalCost ?? '',
    currency: defaultValues?.currency ?? 'EUR',
    validUntil: defaultValues?.validUntil ?? '',
    changeNote: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const totalAmount = useMemo(
    () =>
      n(form.productCost) +
      n(form.logisticsCost) +
      n(form.customsCost) +
      n(form.deliveryCost) +
      n(form.serviceCost) +
      n(form.vatAmount),
    [
      form.productCost,
      form.logisticsCost,
      form.customsCost,
      form.deliveryCost,
      form.serviceCost,
      form.vatAmount,
    ]
  );

  const internalCostVal = n(form.internalCost);
  const grossProfit = totalAmount - internalCostVal;
  const marginPct = totalAmount > 0 ? (grossProfit / totalAmount) * 100 : 0;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEditing = !!quoteId;
  const needsChangeNote = isEditing && !!existingStatus && existingStatus !== 'DRAFT';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      productCost: form.productCost ? parseFloat(form.productCost) : null,
      logisticsCost: form.logisticsCost ? parseFloat(form.logisticsCost) : null,
      customsCost: form.customsCost ? parseFloat(form.customsCost) : null,
      deliveryCost: form.deliveryCost ? parseFloat(form.deliveryCost) : null,
      serviceCost: form.serviceCost ? parseFloat(form.serviceCost) : null,
      vatAmount: form.vatAmount ? parseFloat(form.vatAmount) : null,
      totalAmount: totalAmount > 0 ? totalAmount : null,
      internalCost: form.internalCost ? parseFloat(form.internalCost) : null,
      grossProfit: internalCostVal > 0 && totalAmount > 0 ? grossProfit : null,
      marginPct: internalCostVal > 0 && totalAmount > 0 ? marginPct : null,
      currency: form.currency,
      validUntil: form.validUntil || null,
      ...(isEditing && { changeNote: form.changeNote || null }),
    };

    const url = quoteId
      ? `/api/quotes/${quoteId}`
      : `/api/requests/${importRequestId}/quotes`;

    const res = await fetch(url, {
      method: quoteId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.message ?? 'Greška pri čuvanju ponude.');
      return;
    }

    router.refresh();
  }

  const costFields: [keyof FormData, string][] = [
    ['productCost', 'Trošak proizvoda'],
    ['logisticsCost', 'Logistika'],
    ['customsCost', 'Carina'],
    ['deliveryCost', 'Dostava'],
    ['serviceCost', 'Usluga Import BiH'],
    ['vatAmount', 'PDV'],
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {costFields.map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-ink-700 mb-1">{label}</label>
            <input
              type="number" min="0" step="0.01" className="input-field"
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Valuta</label>
          <select
            className="input-field w-28"
            value={form.currency}
            onChange={(e) => set('currency', e.target.value)}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Vrijedi do</label>
          <input
            type="date" className="input-field"
            value={form.validUntil}
            onChange={(e) => set('validUntil', e.target.value)}
          />
        </div>
      </div>

      {totalAmount > 0 && (
        <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-medium text-brand-700">Ukupni iznos ponude (klijent vidi)</span>
          <span className="text-xl font-bold text-brand-900">
            {mounted ? totalAmount.toLocaleString('bs-BA', { minimumFractionDigits: 2 }) : totalAmount.toFixed(2)} {form.currency}
          </span>
        </div>
      )}

      {/* Internal section */}
      <div className="rounded-lg bg-ink-100 border-2 border-ink-300 p-4 space-y-3">
        <p className="text-sm font-semibold text-ink-700">
          🔒 Interno — klijent ovo NIKAD ne vidi
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-600 mb-1">
              Vlastiti trošak firme
            </label>
            <input
              type="number" min="0" step="0.01" className="input-field text-sm"
              value={form.internalCost}
              onChange={(e) => set('internalCost', e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-end pb-1">
            <span className="text-xs text-ink-500 mb-1">Bruto profit</span>
            <span
              className={`text-base font-semibold ${
                internalCostVal > 0 || totalAmount > 0
                  ? grossProfit >= 0
                    ? 'text-emerald-700'
                    : 'text-red-600'
                  : 'text-ink-400'
              }`}
            >
              {internalCostVal > 0 || totalAmount > 0
                ? `${mounted ? grossProfit.toLocaleString('bs-BA', { minimumFractionDigits: 2 }) : grossProfit.toFixed(2)} ${form.currency}`
                : '—'}
            </span>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <span className="text-xs text-ink-500 mb-1">Marža</span>
            <span
              className={`text-base font-semibold ${
                internalCostVal > 0 && totalAmount > 0
                  ? marginPct >= 0
                    ? 'text-emerald-700'
                    : 'text-red-600'
                  : 'text-ink-400'
              }`}
            >
              {internalCostVal > 0 && totalAmount > 0 ? `${marginPct.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {needsChangeNote && (
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Razlog izmjene <span className="text-red-500">*</span>
          </label>
          <input
            className="input-field"
            placeholder="Kratko objašnjenje izmjene ponude..."
            value={form.changeNote}
            onChange={(e) => set('changeNote', e.target.value)}
            required
          />
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving
          ? 'Čuvam...'
          : isEditing
          ? 'Sačuvaj izmjene ponude'
          : 'Kreiraj ponudu (draft)'}
      </button>
    </form>
  );
}
