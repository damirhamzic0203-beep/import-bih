'use client';

import { useState } from 'react';

interface LogEntry {
  id: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

interface Props {
  logs: LogEntry[];
}

export function AuditLogTable({ logs }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="card overflow-hidden p-0">
      <table className="min-w-full divide-y divide-ink-100">
        <thead className="bg-ink-50">
          <tr>
            {['Korisnik', 'Akcija', 'Entitet', 'ID', 'Datum', ''].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-400">
                Nema zapisa.
              </td>
            </tr>
          )}
          {logs.map((log) => (
            <>
              <tr
                key={log.id}
                className="hover:bg-ink-50 cursor-pointer transition-colors"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <td className="px-4 py-3 text-sm font-medium text-ink-900">{log.actorName}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-ink-100 text-ink-700 rounded px-1.5 py-0.5">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-700">{log.entity}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-400">
                  {log.entityId.slice(0, 10)}…
                </td>
                <td className="px-4 py-3 text-xs text-ink-500">{log.createdAt}</td>
                <td className="px-4 py-3 text-right text-xs text-brand-600">
                  {expandedId === log.id ? '▲' : '▼'}
                </td>
              </tr>
              {expandedId === log.id && (
                <tr key={`${log.id}-detail`}>
                  <td colSpan={6} className="bg-ink-50 px-4 py-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold text-ink-500 uppercase">Staro stanje</p>
                        {log.oldValue ? (
                          <pre className="rounded bg-ink-100 p-3 text-xs text-ink-700 overflow-auto max-h-48">
                            {log.oldValue}
                          </pre>
                        ) : (
                          <p className="text-xs text-ink-400 italic">—</p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold text-ink-500 uppercase">Novo stanje</p>
                        {log.newValue ? (
                          <pre className="rounded bg-ink-100 p-3 text-xs text-ink-700 overflow-auto max-h-48">
                            {log.newValue}
                          </pre>
                        ) : (
                          <p className="text-xs text-ink-400 italic">—</p>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-ink-400">
                      Entity ID: <span className="font-mono">{log.entityId}</span>
                    </p>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
