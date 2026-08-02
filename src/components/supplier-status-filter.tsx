'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SUPPLIER_STATUS_LABELS } from '@/lib/status';

export function SupplierStatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    if (e.target.value) params.set('status', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select value={current} onChange={handleChange} className="input-field w-48">
      <option value="">Svi statusi</option>
      {Object.entries(SUPPLIER_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
