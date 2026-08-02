import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().nullable().optional(),
  featuredImage: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ message: 'Post nije pronađen.' }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: 'Nevalidni podaci.' }, { status: 400 });
  }

  const { status, ...rest } = parsed.data;
  const publishedAt =
    status === 'PUBLISHED' && existing.status !== 'PUBLISHED'
      ? new Date()
      : status === 'DRAFT'
      ? null
      : undefined;

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(status !== undefined ? { status } : {}),
      ...(publishedAt !== undefined ? { publishedAt } : {}),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Zabranjeno.' }, { status: 403 });
  }

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
