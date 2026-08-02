import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { AuditLogTable } from '@/components/audit-log-table';

export default async function AuditLogPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/admin');

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actor: { select: { name: true } },
    },
  });

  const serialized = logs.map((l) => ({
    id: l.id,
    actorName: l.actor?.name ?? 'Sistem',
    action: l.action,
    entity: l.entity,
    entityId: l.entityId,
    oldValue: l.oldValue ? JSON.stringify(l.oldValue, null, 2) : null,
    newValue: l.newValue ? JSON.stringify(l.newValue, null, 2) : null,
    createdAt: l.createdAt.toLocaleString('bs-BA'),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Audit log</h1>
          <p className="text-sm text-ink-500 mt-1">Zadnjih 100 akcija u sistemu</p>
        </div>
      </div>
      <AuditLogTable logs={serialized} />
    </div>
  );
}
