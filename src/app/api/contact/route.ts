import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notify';
import { checkRateLimit, getIp } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const rl = checkRateLimit(getIp(req), 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: 'Previše pokušaja. Pokušajte ponovo za nekoliko minuta.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const { name, company, phone, email, message } = parsed.data;

  await prisma.contactSubmission.create({
    data: { name, company: company ?? null, phone: phone ?? null, email, message },
  });

  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    await Promise.all(
      admins.map((a) =>
        notify(a.id, 'contact_form', `Nova poruka sa kontakt forme: ${name}`, message)
      )
    );
  } catch (notifyErr) {
    console.error('Notify error (contact form):', notifyErr);
  }

  return NextResponse.json({ ok: true });
}
