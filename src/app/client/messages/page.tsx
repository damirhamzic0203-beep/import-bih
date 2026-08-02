import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ClientMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const messages = await prisma.message.findMany({
    where: {
      isInternal: false,
      importRequest: { clientId: session.user.id },
    },
    include: {
      importRequest: { select: { id: true, code: true, productName: true } },
      sender: { select: { role: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by importRequestId, keep last 5 per group (already desc, so first 5 = latest)
  type MsgGroup = {
    requestId: string;
    code: string;
    productName: string;
    latestAt: Date;
    messages: {
      id: string;
      body: string;
      createdAt: Date;
      isFromStaff: boolean;
      senderName: string;
    }[];
  };

  const groupMap: Record<string, MsgGroup> = {};
  for (const msg of messages) {
    const { id: requestId, code, productName } = msg.importRequest;
    if (!groupMap[requestId]) {
      groupMap[requestId] = {
        requestId,
        code,
        productName,
        latestAt: msg.createdAt,
        messages: [],
      };
    }
    if (groupMap[requestId].messages.length < 5) {
      groupMap[requestId].messages.push({
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt,
        isFromStaff: msg.sender.role !== 'CLIENT',
        senderName: msg.sender.name,
      });
    }
  }

  // Sort groups by latestAt desc (most recent activity first)
  const groups = Object.values(groupMap).sort(
    (a, b) => b.latestAt.getTime() - a.latestAt.getTime()
  );

  // Reverse each group's messages so they display oldest→newest
  for (const g of groups) {
    g.messages.reverse();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Poruke</h1>
        <p className="text-sm text-ink-500 mt-1">
          Pregled razgovora s timom Import BiH, grupisano po zahtjevu.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-base font-medium text-ink-700">Nema poruka</p>
          <p className="text-sm text-ink-500 mt-1">
            Poruke s timom Import BiH pojavit će se ovdje. Razgovor možete pokrenuti iz
            detalja zahtjeva.
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
              {/* Group header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink-100">
                <div>
                  <span className="font-mono text-sm font-semibold text-ink-900">
                    {group.code}
                  </span>
                  <span className="ml-2 text-sm text-ink-500">{group.productName}</span>
                </div>
                <span className="text-xs text-ink-400">
                  {group.latestAt.toLocaleDateString('bs-BA')}{' '}
                  {group.latestAt.toLocaleTimeString('bs-BA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Last 5 messages (oldest→newest) */}
              <div className="space-y-2 mb-4">
                {group.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromStaff ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.isFromStaff
                          ? 'bg-ink-100 text-ink-900'
                          : 'bg-brand-600 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p
                        className={`mt-1 text-xs ${
                          msg.isFromStaff ? 'text-ink-500' : 'text-brand-200'
                        }`}
                      >
                        {msg.isFromStaff ? 'Import BiH' : 'Vi'} ·{' '}
                        {msg.createdAt.toLocaleTimeString('bs-BA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href={`/client/requests/${group.requestId}`}
                className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
              >
                Otvori razgovor →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
