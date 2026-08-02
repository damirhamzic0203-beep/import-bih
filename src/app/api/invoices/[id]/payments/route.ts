import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Currency, PaymentStatus } from '@prisma/client';
import { notify } from '@/lib/notify';

const schema = z.object({
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency).default(Currency.EUR),
  paidDate: z.string().nullish(),
  method: z.string().optional(),
  notes: z.string().nullish(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
  });
  if (!invoice) {
    return NextResponse.json({ message: 'Faktura nije pronađena.' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: invoice.orderId,
      invoiceId: invoice.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      paidDate: parsed.data.paidDate ? new Date(parsed.data.paidDate) : null,
      method: parsed.data.method ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  const { _sum } = await prisma.payment.aggregate({
    where: { invoiceId: invoice.id },
    _sum: { amount: true },
  });

  const totalPaid = _sum.amount ? parseFloat(_sum.amount.toString()) : 0;
  const invoiceAmount = parseFloat(invoice.amount.toString());
  const newStatus: PaymentStatus =
    totalPaid >= invoiceAmount
      ? PaymentStatus.PAID
      : totalPaid > 0
      ? PaymentStatus.PARTIALLY_PAID
      : PaymentStatus.UNPAID;

  await prisma.$transaction([
    prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: newStatus },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'payment.created',
        entity: 'Invoice',
        entityId: invoice.id,
        newValue: { paymentId: payment.id, totalPaid, status: newStatus },
      },
    }),
  ]);

  if (newStatus === PaymentStatus.PAID) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: invoice.orderId },
        include: {
          quote: {
            include: {
              importRequest: { select: { id: true, clientId: true } },
            },
          },
        },
      });
      if (order) {
        const { clientId, id: requestId } = order.quote.importRequest;
        await notify(
          clientId,
          'payment_received',
          'Uplata primljena',
          undefined,
          `/client/requests/${requestId}`
        );
      }
    } catch (notifyErr) {
      console.error('Notify error (payment received):', notifyErr);
    }
  }

  return NextResponse.json(payment, { status: 201 });
}
