import { formatCurrency } from '@/lib/status';

interface Props {
  supplierTotal: string | null;
  freightCost: string | null;
  forwarderCustomsCost: string | null;
  deliveryCost: string | null;
  pickupCost: string | null;
  insuranceCost: string | null;
  otherFees: string | null;
  hasSelectedQuote: boolean;
  currency: string;
  hsCode?: { code: string; dutyRate: string } | null;
}

function Row({
  label,
  value,
  note,
  dim,
}: {
  label: string;
  value?: string | null;
  note?: string;
  dim?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink-100 py-2 text-sm last:border-0">
      <span className={dim ? 'italic text-ink-400' : 'text-ink-600'}>{label}</span>
      {value ? (
        <span className="font-medium text-ink-900">{value}</span>
      ) : (
        <span className="text-xs italic text-amber-600">{note ?? '—'}</span>
      )}
    </div>
  );
}

export function LandedCostCalculator({
  supplierTotal,
  freightCost,
  forwarderCustomsCost,
  deliveryCost,
  pickupCost,
  insuranceCost,
  otherFees,
  hasSelectedQuote,
  currency,
  hsCode,
}: Props) {
  function fmt(v: string | null | undefined): string | null {
    if (!v) return null;
    const num = parseFloat(v);
    if (isNaN(num) || num === 0) return null;
    return formatCurrency(v, currency);
  }

  function sum(...vals: (string | null | undefined)[]): number {
    return vals.reduce<number>((acc, v) => {
      if (!v) return acc;
      const n = parseFloat(v);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }

  const otherLogistics = sum(pickupCost, insuranceCost, otherFees);
  const hasOtherLogistics = otherLogistics > 0;

  const estimatedDuty = (() => {
    if (!hsCode?.dutyRate) return null;
    const base = sum(supplierTotal, freightCost);
    if (base === 0) return null;
    return base * (parseFloat(hsCode.dutyRate) / 100);
  })();

  const landedTotal =
    sum(
      supplierTotal,
      freightCost,
      forwarderCustomsCost,
      deliveryCost,
      pickupCost,
      insuranceCost,
      otherFees
    ) + (estimatedDuty ?? 0);

  const isIncomplete = !supplierTotal || !hasSelectedQuote;

  return (
    <div>
      <Row
        label="Trošak dobavljača"
        value={fmt(supplierTotal)}
        note="Nije unesen supplier quote"
      />

      {hasSelectedQuote ? (
        <>
          {fmt(freightCost) && <Row label="Freight (međunarodni)" value={fmt(freightCost)} />}
          {fmt(forwarderCustomsCost) && (
            <Row label="Broker / špediter usluge" value={fmt(forwarderCustomsCost)} />
          )}
          {fmt(deliveryCost) && <Row label="Dostava" value={fmt(deliveryCost)} />}
          {hasOtherLogistics && (
            <Row
              label="Pickup, osiguranje, ostalo"
              value={formatCurrency(String(otherLogistics), currency)}
            />
          )}
        </>
      ) : (
        <Row label="Međunarodni transport" note="Nije odabrana transport ponuda" />
      )}

      {estimatedDuty !== null ? (
        <div className="border-b border-ink-100 py-2 text-sm last:border-0">
          <div className="flex items-baseline justify-between">
            <span className="text-ink-600">Uvozna carina BiH (procjena)</span>
            <span className="font-medium text-ink-900">
              {formatCurrency(String(estimatedDuty), currency)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-amber-600">
            Procjena na osnovu HS koda {hsCode!.code} ({parseFloat(hsCode!.dutyRate).toFixed(2)}%
            na trošak dobavljača + freight) — potvrditi sa špediterom prije finalizacije
          </p>
        </div>
      ) : (
        <Row
          label="Uvozna carina BiH"
          note={
            hsCode
              ? 'Za potvrditi — nedostaje supplier quote za izračun'
              : 'Za potvrditi — dodijelite HS kod za procjenu'
          }
        />
      )}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-ink-900 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">Okvirni Landed Cost</p>
          {isIncomplete && (
            <p className="mt-0.5 text-xs text-ink-400">* Nije finalan — nedostaju stavke</p>
          )}
        </div>
        <span className="text-xl font-bold">
          {landedTotal > 0 ? formatCurrency(String(landedTotal), currency) : '—'}
        </span>
      </div>
    </div>
  );
}
