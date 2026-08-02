import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  forwarderIds: z.array(z.string()).min(1),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.transportRequest.findUnique({
      where: { id: params.id },
      select: { id: true, sentAt: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const now = new Date();

    const created = await prisma.$transaction(async (tx) => {
      const result = await tx.transportRequestRecipient.createMany({
        data: parsed.data.forwarderIds.map((forwarderId) => ({
          transportRequestId: params.id,
          forwarderId,
          sentAt: now,
        })),
        skipDuplicates: true,
      });

      if (!existing.sentAt) {
        await tx.transportRequest.update({
          where: { id: params.id },
          data: { sentAt: now },
        });
      }

      return result;
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'transport_request.sent',
        entity: 'TransportRequest',
        entityId: params.id,
        newValue: {
          forwarderIds: parsed.data.forwarderIds,
          sentCount: created.count,
        },
      },
    });

    return NextResponse.json({ ok: true, sentCount: created.count });
  } catch (err) {
    console.error('Send transport request error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
