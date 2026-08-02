import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Currency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { notify } from '@/lib/notify';

const editSchema = z.object({
  productCost: z.number().optional().nullable(),
  logisticsCost: z.number().optional().nullable(),
  customsCost: z.number().optional().nullable(),
  deliveryCost: z.number().optional().nullable(),
  serviceCost: z.number().optional().nullable(),
  vatAmount: z.number().optional().nullable(),
  totalAmount: z.number().optional().nullable(),
  internalCost: z.number().optional().nullable(),
  grossProfit: z.number().optional().nullable(),
  marginPct: z.number().optional().nullable(),
  currency: z.nativeEnum(Currency).optional(),
  validUntil: z.string().optional().nullable(),
  changeNote: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const existing = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        versions: { orderBy: { versionNo: 'desc' }, take: 1 },
        importRequest: { select: { id: true, clientId: true } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    // Send action
    if (body.action === 'send') {
      if (existing.status !== 'DRAFT') {
        return NextResponse.json(
          { error: 'invalid_status', message: 'Ponuda nije u statusu DRAFT.' },
          { status: 400 }
        );
      }
      await prisma.quote.update({
        where: { id: params.id },
        data: { status: 'SENT', sentAt: new Date() },
      });

      try {
        await notify(
          existing.importRequest.clientId,
          'quote_ready',
          'Nova ponuda je spremna',
          undefined,
          `/client/requests/${existing.importRequest.id}`
        );
      } catch (notifyErr) {
        console.error('Notify error (quote sent):', notifyErr);
      }

      return NextResponse.json({ ok: true });
    }

    // Edit action
    const parsed = editSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { changeNote, validUntil, ...fields } = parsed.data;
    const currentVersionNo = existing.versions[0]?.versionNo ?? 0;

    await prisma.$transaction(async (tx) => {
      await tx.quote.update({
        where: { id: params.id },
        data: {
          ...fields,
          validUntil:
            validUntil !== undefined
              ? validUntil
                ? new Date(validUntil)
                : null
              : undefined,
        },
      });

      if (existing.status !== 'DRAFT') {
        await tx.quoteVersion.create({
          data: {
            quoteId: params.id,
            versionNo: currentVersionNo + 1,
            changedById: session.user.id,
            changeNote: changeNote ?? null,
            snapshot: { ...fields, validUntil },
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
