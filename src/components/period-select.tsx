'use client';

import { useRouter } from 'next/navigation';

const OPTIONS = [
  { value: 'today', label: 'Danas' },
  { value: 'week', label: 'Ova sedmica' },
  { value: 'month', label: 'Ovaj mjesec' },
  { value: 'year', label: 'Ova godina' },
  { value: 'all', label: 'Sve' },
];

export function PeriodSelect({ value }: { value: string }) {
  const router = useRouter();

  return (
    <select
      className="input-field w-44"
      value={value}
      onChange={(e) => router.push(`/admin/reports?period=${e.target.value}`)}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
