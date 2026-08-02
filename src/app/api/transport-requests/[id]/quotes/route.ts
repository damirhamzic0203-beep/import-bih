import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Currency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  forwarderId: z.string().min(1),
  price: z.number().optional().nullable(),
  currency: z.nativeEnum(Currency).default('EUR'),
  transitDays: z.number().int().min(1).optional().nullable(),
  validUntil: z.string().optional().nullable(),
  pickupCost: z.number().optional().nullable(),
  freightCost: z.number().optional().nullable(),
  customsCost: z.number().optional().nullable(),
  deliveryCost: z.number().optional().nullable(),
  insuranceCost: z.number().optional().nullable(),
  otherFees: z.number().optional().nullable(),
  totalCost: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
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
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const { validUntil, ...rest } = parsed.data;

    const quote = await prisma.forwarderQuote.create({
      data: {
        transportRequestId: params.id,
        validUntil: validUntil ? new Date(validUntil) : null,
        ...rest,
      },
    });

    return NextResponse.json({ ok: true, id: quote.id }, { status: 201 });
  } catch (err) {
    console.error('Create forwarder quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
