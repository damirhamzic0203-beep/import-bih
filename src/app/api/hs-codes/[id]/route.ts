import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(1).max(20).optional(),
  description: z.string().min(1).max(500).optional(),
  dutyRate: z.number().min(0).max(100).optional(),
  notes: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  try {
    const updated = await prisma.hsCode.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { message: 'HS kod sa ovim brojem već postoji u bazi.' },
        { status: 409 }
      );
    }
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ message: 'HS kod nije pronađen.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Greška pri ažuriranju.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'CLIENT') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  try {
    await prisma.hsCode.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2025') {
      return NextResponse.json({ message: 'HS kod nije pronađen.' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Greška pri brisanju.' }, { status: 500 });
  }
}
