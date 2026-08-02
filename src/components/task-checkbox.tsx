'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function TaskCheckbox({
  taskId,
  isDone,
}: {
  taskId: string;
  isDone: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: isDone ? 'TODO' : 'DONE' }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <input
      type="checkbox"
      checked={isDone}
      onChange={toggle}
      disabled={loading}
      className="h-4 w-4 shrink-0 accent-brand-600 disabled:cursor-wait"
    />
  );
}
