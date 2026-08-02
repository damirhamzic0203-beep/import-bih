'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/status';

export type StatusBarDatum = { label: string; count: number };
export type MonthRevenueDatum = { month: string; revenue: number; profit: number };

// ─── Custom Tooltips ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatusTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-ink-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-ink-800">{label}</p>
      <p className="mt-0.5 text-xs text-brand-600">{payload[0].value} zahtjeva</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="space-y-1 rounded-lg border border-ink-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-xs font-semibold text-ink-800">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-xs">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-ink-500">
            {p.dataKey === 'revenue' ? 'Prihod' : 'Profit'}:
          </span>
          <span className="font-semibold text-ink-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export function StatusBarChart({ data }: { data: StatusBarDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 9.5, fill: '#94a3b8' }}
          angle={-38}
          textAnchor="end"
          interval={0}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<StatusTooltip />}
          cursor={{ fill: 'rgba(20,120,168,0.06)' }}
        />
        <Bar dataKey="count" fill="#1478a8" radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueAreaChart({ data }: { data: MonthRevenueDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1478a8" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#1478a8" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`
          }
        />
        <Tooltip content={<RevenueTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(val) => (val === 'revenue' ? 'Prihod' : 'Profit')}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="revenue"
          stroke="#1478a8"
          strokeWidth={2}
          fill="url(#gRev)"
          dot={false}
          activeDot={{ r: 4, fill: '#1478a8' }}
        />
        <Area
          type="monotone"
          dataKey="profit"
          name="profit"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#gPro)"
          dot={false}
          activeDot={{ r: 4, fill: '#10b981' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
