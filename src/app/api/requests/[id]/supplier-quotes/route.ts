import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { Currency } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  unitPrice: z.number().optional().nullable(),
  quantity: z.number().int().min(1).optional().nullable(),
  moq: z.number().int().min(1).optional().nullable(),
  packagingCost: z.number().optional().nullable(),
  toolingCost: z.number().optional().nullable(),
  shippingChina: z.number().optional().nullable(),
  inspectionCost: z.number().optional().nullable(),
  otherCosts: z.number().optional().nullable(),
  currency: z.nativeEnum(Currency).default('USD'),
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
      select: { id: true, supplierId: true },
    });

    if (!importRequest) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    if (!importRequest.supplierId) {
      return NextResponse.json(
        { error: 'no_supplier', message: 'Zahtjev nema odabranog dobavljača.' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const supplierTotal =
      (d.unitPrice ?? 0) * (d.quantity ?? 1) +
      (d.packagingCost ?? 0) +
      (d.toolingCost ?? 0) +
      (d.shippingChina ?? 0) +
      (d.inspectionCost ?? 0) +
      (d.otherCosts ?? 0);

    const quote = await prisma.supplierQuote.create({
      data: {
        importRequestId: params.id,
        supplierId: importRequest.supplierId,
        unitPrice: d.unitPrice,
        quantity: d.quantity,
        moq: d.moq,
        packagingCost: d.packagingCost,
        toolingCost: d.toolingCost,
        shippingChina: d.shippingChina,
        inspectionCost: d.inspectionCost,
        otherCosts: d.otherCosts,
        currency: d.currency,
        supplierTotal: supplierTotal > 0 ? supplierTotal : null,
      },
    });

    return NextResponse.json({ ok: true, id: quote.id }, { status: 201 });
  } catch (err) {
    console.error('Create supplier quote error:', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
