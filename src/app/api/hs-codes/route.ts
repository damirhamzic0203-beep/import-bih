import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  code: z.string().min(1).max(20),
  description: z.string().min(1).max(500),
  dutyRate: z.number().min(0).max(100),
  notes: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
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
    const hsCode = await prisma.hsCode.create({
      data: {
        code: parsed.data.code,
        description: parsed.data.description,
        dutyRate: parsed.data.dutyRate,
        notes: parsed.data.notes ?? null,
        source: parsed.data.source ?? null,
      },
    });
    return NextResponse.json(hsCode, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { message: 'HS kod sa ovim brojem već postoji u bazi.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: 'Greška pri kreiranju.' }, { status: 500 });
  }
}
