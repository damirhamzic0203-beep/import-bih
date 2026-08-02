import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Currency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
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
  currency: z.nativeEnum(Currency).default('EUR'),
  validUntil: z.string().optional().nullable(),
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

    const importRequest = await prisma.importRequest.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!importRequest) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const count = await prisma.quote.count();
    const code = `Q-${String(count + 1).padStart(6, '0')}`;

    const { validUntil, ...rest } = parsed.data;

    const quote = await prisma.quote.create({
      data: {
        code,
        importRequestId: params.id,
        status: 'DRAFT',
        validUntil: validUntil ? new Date(validUntil) : null,
        ...rest,
      },
    });

    await prisma.quoteVersion.create({
      data: {
        quoteId: quote.id,
        versionNo: 1,
        changedById: session.user.id,
        changeNote: 'Kreirana ponuda',
        snapshot: { code: quote.code, status: quote.status, ...rest },
      },
    });

    return NextResponse.json({ ok: true, quoteId: quote.id, code }, { status: 201 });
  } catch (err) {
    console.error('Create quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
