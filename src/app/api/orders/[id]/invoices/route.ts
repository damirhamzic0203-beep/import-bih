import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Currency } from '@prisma/client';

const schema = z.object({
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency).default(Currency.EUR),
  dueDate: z.string().nullish(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const existing = await prisma.invoice.findFirst({
    where: { orderId: params.id },
  });
  if (existing) {
    return NextResponse.json({ message: 'Faktura već postoji za ovu narudžbu.' }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;

  const invoice = await prisma.invoice.create({
    data: {
      orderId: params.id,
      invoiceNumber,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: 'UNPAID',
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
