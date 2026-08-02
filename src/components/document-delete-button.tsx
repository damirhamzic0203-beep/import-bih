'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj dokument?')) return;
    setDeleting(true);
    await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {deleting ? '...' : 'Obriši'}
    </button>
  );
}
