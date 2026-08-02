import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') redirect('/client/dashboard');

  const messages = await prisma.message.findMany({
    where: { isInternal: false },
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
      sender: { select: { role: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  type MsgGroup = {
    requestId: string;
    code: string;
    clientName: string;
    companyName: string | null;
    latestAt: Date;
    msgs: {
      id: string;
      body: string;
      createdAt: Date;
      isFromStaff: boolean;
      senderName: string;
    }[];
  };

  const groupMap: Record<string, MsgGroup> = {};
  for (const msg of messages) {
    const { id: requestId, code, client } = msg.importRequest;
    if (!groupMap[requestId]) {
      groupMap[requestId] = {
        requestId,
        code,
        clientName: client.name,
        companyName: client.company?.name ?? null,
        latestAt: msg.createdAt,
        msgs: [],
      };
    }
    if (groupMap[requestId].msgs.length < 3) {
      groupMap[requestId].msgs.push({
        id: msg.id,
        body: msg.body,
        createdAt: msg.createdAt,
        isFromStaff: msg.sender.role !== 'CLIENT',
        senderName: msg.sender.name,
      });
    }
  }

  const groups = Object.values(groupMap)
    .sort((a, b) => b.latestAt.getTime() - a.latestAt.getTime());

  // Reverse each group to oldest→newest for display
  for (const g of groups) g.msgs.reverse();

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-ink-900">Poruke</h1>

      {groups.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-ink-400 text-sm">Nema poruka.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.requestId} className="card">
              {/* Group header */}
              <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3">
                <div>
                  <span className="font-mono text-sm font-semibold text-ink-900">
                    {group.code}
                  </span>
                  <span className="ml-2 font-medium text-sm text-ink-700">
                    {group.clientName}
                  </span>
                  {group.companyName && (
                    <span className="ml-1 text-xs text-ink-500">· {group.companyName}</span>
                  )}
                </div>
                <span className="text-xs text-ink-400">
                  {group.latestAt.toLocaleDateString('bs-BA')}{' '}
                  {group.latestAt.toLocaleTimeString('bs-BA', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Last 3 messages oldest→newest */}
              <div className="mb-4 space-y-2">
                {group.msgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isFromStaff ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
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
                        {msg.isFromStaff ? msg.senderName : group.clientName} ·{' '}
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
                href={`/admin/requests/${group.requestId}`}
                className="text-sm text-brand-600 hover:underline"
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
