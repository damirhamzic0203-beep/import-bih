import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  body: z.string().min(1, 'Bilješka ne može biti prazna'),
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
    const reqBody = await request.json();
    const parsed = schema.safeParse(reqBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await prisma.internalNote.create({
      data: {
        importRequestId: params.id,
        authorId: session.user.id,
        body: parsed.data.body.trim(),
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Add note error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
