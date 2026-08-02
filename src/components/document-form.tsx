'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FOLDERS = [
  '01 Dobavljač',
  '02 Nabavka',
  '03 Kontrola kvaliteta',
  '04 Transport',
  '05 Carina',
  '06 Dostava',
];

interface Props {
  importRequestId: string;
}

export function DocumentForm({ importRequestId }: Props) {
  const router = useRouter();
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/requests/${importRequestId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, fileName, fileUrl, visibleToClient }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri dodavanju dokumenta.');
      return;
    }

    setFileName('');
    setFileUrl('');
    setVisibleToClient(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Folder</label>
          <select
            className="input-field"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
          >
            {FOLDERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">Naziv fajla</label>
          <input
            className="input-field"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="npr. Faktura-dobavljač.pdf"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-ink-700 mb-1">
            URL dokumenta (Google Drive, itd.)
          </label>
          <input
            type="url"
            className="input-field"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
        <input
          type="checkbox"
          checked={visibleToClient}
          onChange={(e) => setVisibleToClient(e.target.checked)}
        />
        Vidljivo klijentu
      </label>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Dodajem...' : '+ Dodaj dokument'}
      </button>
    </form>
  );
}
