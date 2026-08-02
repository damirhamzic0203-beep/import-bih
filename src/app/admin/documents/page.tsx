import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const documents = await prisma.document.findMany({
    include: {
      importRequest: {
        select: {
          id: true,
          code: true,
          client: {
            select: {
              name: true,
              company: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink-900">Dokumenti</h1>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100 text-sm">
          <thead className="bg-ink-50">
            <tr>
              {['Zahtjev', 'Klijent', 'Folder', 'Fajl', 'Vidljivost', 'Datum', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100 bg-white">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-400">
                  Nema dokumenata.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono font-medium text-ink-900">
                    {doc.importRequest ? (
                      <Link
                        href={`/admin/requests/${doc.importRequest.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {doc.importRequest.code}
                      </Link>
                    ) : (
                      <span className="text-ink-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {doc.importRequest ? (
                      <>
                        <span className="block font-medium text-ink-800">
                          {doc.importRequest.client.name}
                        </span>
                        {doc.importRequest.client.company && (
                          <span className="text-xs text-ink-500">
                            {doc.importRequest.client.company.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-ink-400">Dobavljač</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{doc.folder}</td>
                  <td className="px-4 py-3">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      {doc.fileName}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    {doc.visibleToClient ? (
                      <span className="badge bg-emerald-100 text-emerald-800">
                        Vidljivo klijentu
                      </span>
                    ) : (
                      <span className="badge bg-ink-100 text-ink-600">Interno</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {doc.uploadedAt.toLocaleDateString('bs-BA')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {doc.importRequest && (
                      <Link
                        href={`/admin/requests/${doc.importRequest.id}`}
                        className="whitespace-nowrap text-brand-600 hover:underline"
                      >
                        Zahtjev →
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
