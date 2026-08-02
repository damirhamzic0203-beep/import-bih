'use client';

import { useRouter, usePathname } from 'next/navigation';
import { IMPORT_STATUS_LABELS } from '@/lib/status';

export function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (e.target.value) params.set('status', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select value={current} onChange={handleChange} className="input-field w-56">
      <option value="">Svi statusi</option>
      {Object.entries(IMPORT_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
