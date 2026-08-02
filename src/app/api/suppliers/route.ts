import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  companyName: z.string().min(1, 'Naziv firme je obavezan'),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  wechat: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  alibabaUrl: z.string().optional().nullable(),
  url1688: z.string().optional().nullable(),
  country: z.string().default('China'),
  city: z.string().optional().nullable(),
  isFactory: z.boolean().default(false),
  categories: z.array(z.string()).default([]),
  moq: z.number().int().positive().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
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

    const supplier = await prisma.supplier.create({ data: parsed.data });

    return NextResponse.json({ ok: true, id: supplier.id }, { status: 201 });
  } catch (err) {
    console.error('Create supplier error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
