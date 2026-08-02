import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { SupplierStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1).optional(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  wechat: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  alibabaUrl: z.string().optional().nullable(),
  url1688: z.string().optional().nullable(),
  country: z.string().optional(),
  city: z.string().optional().nullable(),
  isFactory: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  moq: z.number().int().positive().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  status: z.nativeEnum(SupplierStatus).optional(),
  verificationScore: z.number().int().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
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

    const existing = await prisma.supplier.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    await prisma.supplier.update({ where: { id: params.id }, data: parsed.data });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'supplier.updated',
        entity: 'Supplier',
        entityId: params.id,
        newValue: { fields: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Update supplier error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
