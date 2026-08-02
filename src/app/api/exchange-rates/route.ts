import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  fromCurrency: z.string().min(1).max(10),
  toCurrency: z.string().min(1).max(10),
  rate: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const { fromCurrency, toCurrency, rate } = parsed.data;

  if (fromCurrency === toCurrency) {
    return NextResponse.json(
      { message: 'Polazna i ciljna valuta moraju biti različite.' },
      { status: 400 }
    );
  }

  const result = await prisma.exchangeRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency, toCurrency } },
    create: { fromCurrency, toCurrency, rate, updatedById: session.user.id },
    update: { rate, updatedById: session.user.id },
  });

  return NextResponse.json(result);
}
