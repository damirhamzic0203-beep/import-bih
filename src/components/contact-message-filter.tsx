'use client';

import { useRouter } from 'next/navigation';

export function ContactMessageFilter({ current }: { current: string }) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    router.push(val ? `/admin/contact-messages?status=${val}` : '/admin/contact-messages');
  }

  return (
    <select value={current} onChange={handleChange} className="input-field w-auto">
      <option value="">Sve poruke</option>
      <option value="NOVA">Nova</option>
      <option value="ODGOVORENO">Odgovoreno</option>
      <option value="ARHIVIRANO">Arhivirano</option>
    </select>
  );
}
