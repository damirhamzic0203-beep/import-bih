const STEPS = [
  { label: 'China Warehouse', name: 'Kinesko skladište' },
  { label: 'Export Customs', name: 'Izvozna carina' },
  { label: 'Departed China', name: 'Napustilo Kinu' },
  { label: 'In Transit', name: 'U tranzitu' },
  { label: 'EU Transit', name: 'EU tranzit' },
  { label: 'Bosnia Customs', name: 'Carina BiH' },
  { label: 'Delivery', name: 'Dostava' },
  { label: 'Completed', name: 'Završeno' },
] as const;

const STATUS_TO_ACTIVE_LABEL: Record<string, string> = {
  ORDER_CONFIRMED: 'China Warehouse',
  GOODS_READY: 'China Warehouse',
  IN_TRANSIT: 'Departed China',
  CUSTOMS: 'Bosnia Customs',
  DELIVERY: 'Delivery',
  COMPLETED: 'Completed',
};

interface Props {
  eventLabels: string[];
  currentStatus: string;
}

export function ShipmentTracker({ eventLabels, currentStatus }: Props) {
  const doneSet = new Set(eventLabels);
  const activeLabel = STATUS_TO_ACTIVE_LABEL[currentStatus] ?? null;

  return (
    <div>
      {STEPS.map((step, idx) => {
        const isDone = doneSet.has(step.label);
        const isActive = !isDone && step.label === activeLabel;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.label} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-brand-600 text-white ring-2 ring-brand-200 ring-offset-1'
                    : 'border border-ink-300 bg-white text-ink-400'
                }`}
              >
                {isDone ? '✓' : isActive ? '●' : '○'}
              </div>
              {!isLast && (
                <div className={`h-5 w-px ${isDone ? 'bg-emerald-400' : 'bg-ink-200'}`} />
              )}
            </div>
            <span
              className={`py-0.5 text-xs leading-tight ${
                isActive
                  ? 'font-semibold text-brand-700'
                  : isDone
                  ? 'text-ink-600'
                  : 'text-ink-400'
              }`}
            >
              {step.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
