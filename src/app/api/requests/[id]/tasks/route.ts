import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { TaskPriority } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(1, 'Naslov taska je obavezan'),
  deadline: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
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
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'validation_error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        importRequestId: params.id,
        title: parsed.data.title,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
        priority: parsed.data.priority,
      },
    });

    return NextResponse.json({ ok: true, id: task.id }, { status: 201 });
  } catch (err) {
    console.error('Create task error:', err);
    return NextResponse.json(
      { error: 'server_error', message: 'Došlo je do greške.' },
      { status: 500 }
    );
  }
}
