import { IMPORT_STATUS_LABELS } from '@/lib/status';

const STATUS_ORDER = [
  'NEW',
  'UNDER_REVIEW',
  'SOURCING',
  'SUPPLIER_SELECTED',
  'NEGOTIATION',
  'QUALITY_CONTROL',
  'TRANSPORT_QUOTATION',
  'CLIENT_APPROVAL',
  'ORDER_CONFIRMED',
  'GOODS_READY',
  'IN_TRANSIT',
  'CUSTOMS',
  'DELIVERY',
  'COMPLETED',
] as const;

type MainStatus = (typeof STATUS_ORDER)[number];

export function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const isRequiresAssessment = currentStatus === 'REQUIRES_ASSESSMENT';
  const effectiveIndex = isRequiresAssessment
    ? -1
    : STATUS_ORDER.indexOf(currentStatus as MainStatus);

  return (
    <div className="space-y-3">
      {isRequiresAssessment && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          Ovaj zahtjev čeka ručnu procjenu od strane tima Import BiH.
        </div>
      )}
      <div>
        {STATUS_ORDER.map((status, index) => {
          const isDone = effectiveIndex > index;
          const isCurrent = effectiveIndex === index;
          const isLast = index === STATUS_ORDER.length - 1;

          return (
            <div key={status} className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-200 ring-offset-1'
                      : 'border border-ink-300 bg-white text-ink-400'
                  }`}
                >
                  {isDone ? '✓' : index + 1}
                </div>
                {!isLast && (
                  <div className={`h-5 w-px ${isDone ? 'bg-emerald-400' : 'bg-ink-200'}`} />
                )}
              </div>
              <span
                className={`py-0.5 text-xs leading-tight ${
                  isCurrent
                    ? 'font-semibold text-brand-700'
                    : isDone
                    ? 'text-ink-600'
                    : 'text-ink-400'
                }`}
              >
                {IMPORT_STATUS_LABELS[status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
