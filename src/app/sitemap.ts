import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/blog', priority: 0.8 },
  { path: '/uvoz-iz-kine', priority: 0.9 },
  { path: '/uvoz-robe-iz-kine', priority: 0.9 },
  { path: '/sourcing-kina', priority: 0.8 },
  { path: '/transport-kina-bih', priority: 0.8 },
  { path: '/alibaba-bih', priority: 0.8 },
  { path: '/carinska-procedura', priority: 0.8 },
  { path: '/kalkulator-uvoza', priority: 0.7 },
  { path: '/o-nama', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; updatedAt: Date }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    });
  } catch (err) {
    console.error('Sitemap: ne mogu učitati članke', err);
  }

  const latest = posts.reduce<Date | undefined>(
    (acc, p) => (!acc || p.updatedAt > acc ? p.updatedAt : acc),
    undefined
  );

  return [
    ...STATIC_PAGES.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'monthly' as const,
      priority,
      ...(path === '/blog' && latest ? { lastModified: latest } : {}),
    })),
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
