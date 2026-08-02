import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { onQuoteAccepted } from '@/lib/automations';

const schema = z.object({
  action: z.enum(['accept', 'request_changes', 'decline']),
  note: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
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

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        importRequest: { select: { id: true, clientId: true } },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (quote.importRequest.clientId !== session.user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (quote.status !== 'SENT') {
      return NextResponse.json(
        { error: 'invalid_status', message: 'Ponuda trenutno nije u statusu SENT.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const { action, note } = parsed.data;
    const importRequestId = quote.importRequest.id;

    if (action === 'accept') {
      await prisma.$transaction(async (tx) => {
        await tx.quote.update({
          where: { id: params.id },
          data: { status: 'ACCEPTED', respondedAt: now },
        });
        await tx.importRequest.update({
          where: { id: importRequestId },
          data: { status: 'ORDER_CONFIRMED' },
        });
        await tx.order.create({
          data: { quoteId: params.id, confirmedAt: now },
        });
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'quote.accepted',
            entity: 'Quote',
            entityId: params.id,
            newValue: { action },
          },
        });
      });
      await onQuoteAccepted(importRequestId);
    } else if (action === 'request_changes') {
      await prisma.$transaction(async (tx) => {
        await tx.quote.update({
          where: { id: params.id },
          data: { status: 'CHANGES_REQUESTED', respondedAt: now },
        });
        if (note) {
          await tx.message.create({
            data: {
              importRequestId,
              senderId: session.user.id,
              body: note,
              isInternal: false,
            },
          });
        }
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'quote.changes_requested',
            entity: 'Quote',
            entityId: params.id,
            newValue: { action, note: note ?? null },
          },
        });
      });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.quote.update({
          where: { id: params.id },
          data: { status: 'DECLINED', respondedAt: now },
        });
        await tx.auditLog.create({
          data: {
            actorId: session.user.id,
            action: 'quote.declined',
            entity: 'Quote',
            entityId: params.id,
            newValue: { action },
          },
        });
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Respond to quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
