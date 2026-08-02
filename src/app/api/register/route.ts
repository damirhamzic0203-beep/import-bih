import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { checkRateLimit, getIp } from '@/lib/rate-limit';

const registerSchema = z.object({
  name: z.string().min(2, 'Ime i prezime je obavezno'),
  companyName: z.string().min(2, 'Naziv firme je obavezan'),
  taxId: z.string().optional(),
  email: z.string().email('Neispravna email adresa'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  password: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
});

export async function POST(request: Request) {
  const rl = checkRateLimit(getIp(request), 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, companyName, taxId, email, phone, address, city, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'email_taken', message: 'Ovaj email je već registrovan.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const company = await prisma.company.create({
      data: {
        name: companyName,
        taxId,
        address,
        city,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        passwordHash,
        role: Role.CLIENT,
        companyId: company.id,
      },
      select: { id: true, email: true, name: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'user.registered',
        entity: 'User',
        entityId: user.id,
        newValue: { email: user.email, companyId: company.id },
      },
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške. Pokušajte ponovo.' },
      { status: 500 }
    );
  }
}
