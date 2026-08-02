import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: { title: true, seoTitle: true, metaDescription: true, excerpt: true },
  });
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!post || post.status !== 'PUBLISHED') notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/blog" className="text-sm text-brand-600 hover:underline mb-6 inline-block">
          ← Blog
        </Link>

        {post.featuredImage && (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="mb-8 h-80 w-full rounded-2xl object-cover md:h-96"
          />
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-ink-500">
          {post.publishedAt && (
            <span>{post.publishedAt.toLocaleDateString('bs-BA')}</span>
          )}
          {post.author?.name && <span>· {post.author.name}</span>}
          {post.categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700"
            >
              {c}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-ink-900 mb-6">{post.title}</h1>

        <div className="prose prose-lg max-w-none prose-headings:text-ink-900 prose-headings:font-semibold prose-a:text-brand-700 prose-img:rounded-xl prose-img:shadow-elevated prose-strong:text-ink-900">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="mt-12 rounded-2xl bg-brand-50 p-6 text-center">
          <p className="text-base font-semibold text-ink-900 mb-2">
            Zainteresovani za uvoz iz Kine?
          </p>
          <p className="text-sm text-ink-600 mb-4">
            Pošaljite nam zahtjev i dobit ćete individualnu ponudu.
          </p>
          <Link href="/register" className="btn-primary">
            Zatražite ponudu
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
