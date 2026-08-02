import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ClientDocumentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const documents = await prisma.document.findMany({
    where: {
      visibleToClient: true,
      importRequest: { clientId: session.user.id },
    },
    include: {
      importRequest: { select: { id: true, code: true, productName: true } },
    },
    orderBy: [{ uploadedAt: 'asc' }],
  });

  // Group by importRequest, then by folder
  type DocGroup = {
    requestId: string;
    code: string;
    productName: string;
    byFolder: Record<
      string,
      { id: string; fileName: string; fileUrl: string; uploadedAt: Date }[]
    >;
  };

  const grouped: Record<string, DocGroup> = {};
  for (const doc of documents) {
    if (!doc.importRequest) continue;
    const { id: requestId, code, productName } = doc.importRequest;
    if (!grouped[requestId]) {
      grouped[requestId] = { requestId, code, productName, byFolder: {} };
    }
    if (!grouped[requestId].byFolder[doc.folder]) {
      grouped[requestId].byFolder[doc.folder] = [];
    }
    grouped[requestId].byFolder[doc.folder].push({
      id: doc.id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      uploadedAt: doc.uploadedAt,
    });
  }

  const groups = Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Dokumenti</h1>
        <p className="text-sm text-ink-500 mt-1">
          Svi dokumenti koji su vam dostupni, grupisani po zahtjevu.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-base font-medium text-ink-700">Nema dokumenata</p>
          <p className="text-sm text-ink-500 mt-1">
            Dokumenti (fakture, carinske isprave, CMR…) bit će dostupni ovdje čim ih naš tim
            podijeli s vama.
          </p>
          <Link
            href="/client/requests"
            className="inline-block mt-4 text-sm text-brand-600 hover:underline"
          >
            Pregledaj moje zahtjeve →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.requestId} className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-mono text-sm font-semibold text-ink-900">
                    {group.code}
                  </span>
                  <span className="ml-2 text-sm text-ink-500">{group.productName}</span>
                </div>
                <Link
                  href={`/client/requests/${group.requestId}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Otvori zahtjev →
                </Link>
              </div>

              <div className="space-y-4">
                {Object.entries(group.byFolder)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([folder, docs]) => (
                    <div key={folder}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                        {folder}
                      </p>
                      <div className="space-y-1.5">
                        {docs.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-brand-700 hover:bg-ink-100"
                          >
                            <span>📄</span>
                            <span className="flex-1 hover:underline">{doc.fileName}</span>
                            <span className="text-xs text-ink-400">
                              {doc.uploadedAt.toLocaleDateString('bs-BA')}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
