import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Blog — Import BiH',
  description: 'Savjeti, vodiči i vijesti o uvozu robe iz Kine u Bosnu i Hercegovinu.',
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    select: { slug: true, title: true, excerpt: true, publishedAt: true, categories: true },
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold text-ink-900">Blog</h1>
        <p className="mb-10 text-ink-500">Savjeti i vodiči za uvoz iz Kine u BiH.</p>

        {posts.length === 0 ? (
          <p className="text-ink-400">Uskoro — pratite nas za prve objave.</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="card">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {post.categories.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
                    >
                      {c}
                    </span>
                  ))}
                  {post.publishedAt && (
                    <span className="text-xs text-ink-400">
                      {post.publishedAt.toLocaleDateString('bs-BA')}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-ink-900 mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-brand-700">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-ink-600 mb-3">{post.excerpt}</p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Čitaj više →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
