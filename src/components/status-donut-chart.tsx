'use client';

export type DonutSegment = {
  label: string;
  count: number;
  color: string;
};

export function StatusDonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((s, g) => s + g.count, 0);
  const r = 42;
  const cx = 56;
  const cy = 56;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const fraction = total > 0 ? seg.count / total : 0;
    const arcLen = fraction * circumference;
    const arc = { ...seg, arcLen, offset: -cumulative };
    cumulative += arcLen;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />

        {arcs.map((arc, i) =>
          arc.count > 0 ? (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.arcLen} ${circumference}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ) : null
        )}

        {total > 0 ? (
          <>
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">
              {total}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8.5" fill="#94a3b8" letterSpacing="0.05em">
              ZAHTJEVA
            </text>
          </>
        ) : (
          <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#94a3b8">
            Nema
          </text>
        )}
      </svg>

      <div className="min-w-0 flex-1 space-y-2.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="truncate text-xs text-ink-500">{seg.label}</span>
            <span className="ml-auto text-xs font-bold text-ink-900">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
