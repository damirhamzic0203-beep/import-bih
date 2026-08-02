import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  isRecommended: z.boolean().optional(),
  recommendReason: z.string().optional().nullable(),
  isSelected: z.boolean().optional(),
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
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.forwarderQuote.findUnique({
      where: { id: params.id },
      select: { id: true, transportRequestId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (parsed.data.isSelected === true) {
      await prisma.$transaction([
        prisma.forwarderQuote.updateMany({
          where: { transportRequestId: existing.transportRequestId },
          data: { isSelected: false },
        }),
        prisma.forwarderQuote.update({
          where: { id: params.id },
          data: { isSelected: true },
        }),
      ]);
    } else if (parsed.data.isSelected === false) {
      await prisma.forwarderQuote.update({
        where: { id: params.id },
        data: { isSelected: false },
      });
    } else {
      await prisma.forwarderQuote.update({
        where: { id: params.id },
        data: {
          isRecommended: parsed.data.isRecommended,
          recommendReason: parsed.data.recommendReason,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update forwarder quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
