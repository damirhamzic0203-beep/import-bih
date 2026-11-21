import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BlogCard } from '@/components/blog-card';
import { BlogCover } from '@/components/blog-cover';
import { BlogMarkdown, extractH2 } from '@/components/blog-markdown';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL, SITE_NAME, absUrl, truncate } from '@/lib/site';

interface Props {
  params: { slug: string };
}

type Faq = { q: string; a: string };

function parseFaq(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (i): i is Faq =>
      !!i &&
      typeof i.q === 'string' &&
      typeof i.a === 'string' &&
      i.q.trim() !== '' &&
      i.a.trim() !== ''
  );
}

function readingMinutes(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  if (!post || post.status !== 'PUBLISHED') return {};

  const title = truncate(post.seoTitle || post.title, 60);
  const description = truncate(post.metaDescription || post.excerpt || '', 155) || undefined;
  const image = post.coverImage ?? post.featuredImage;
  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'bs_BA',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: image
        ? [{ url: absUrl(image), width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [absUrl(image)] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!post || post.status !== 'PUBLISHED') notFound();

  const others = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED', slug: { not: post.slug } },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      featuredImage: true,
      publishedAt: true,
      tags: true,
    },
  });

  const cover = post.coverImage ?? post.featuredImage;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const faq = parseFaq(post.faq);
  const toc = extractH2(post.content);
  const published = post.publishedAt ?? post.createdAt;

  const organization = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  const blogPostingLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: truncate(post.title, 110),
    description: post.metaDescription || post.excerpt || undefined,
    image: cover ? [absUrl(cover)] : undefined,
    datePublished: published.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: 'bs',
    keywords: post.keywords || post.tags.join(', ') || undefined,
    author: organization,
    publisher: {
      ...organization,
      logo: { '@type': 'ImageObject', url: absUrl('/icon.svg') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  const faqLd =
    faq.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

  return (
    <>
      <JsonLd data={faqLd ? [blogPostingLd, breadcrumbLd, faqLd] : [blogPostingLd, breadcrumbLd]} />
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-4xl px-6 pt-10">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-500">
            <Link href="/" className="hover:text-brand-700 hover:underline">
              Početna
            </Link>
            <span className="mx-2">›</span>
            <Link href="/blog" className="hover:text-brand-700 hover:underline">
              Blog
            </Link>
          </nav>
          <BlogCover
            src={cover}
            alt={post.title}
            priority
            className="aspect-[1200/630] w-full rounded-2xl shadow-elevated"
          />
        </div>

        <article className="mx-auto max-w-[720px] px-6 py-10">
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 md:text-5xl">
            {post.title}
          </h1>
          <div className="mb-10 flex flex-wrap items-center gap-x-3 border-b border-ink-200 pb-6 text-sm text-ink-500">
            <time dateTime={published.toISOString()}>{published.toLocaleDateString('bs-BA')}</time>
            <span>· {readingMinutes(post.content)} min čitanja</span>
            {post.author?.name && <span>· {post.author.name}</span>}
          </div>

          {toc.length >= 4 && (
            <nav
              aria-label="Sadržaj"
              className="mb-10 rounded-xl border border-ink-200 bg-ink-50 p-5"
            >
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-700">
                Sadržaj
              </p>
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-brand-700">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="hover:underline">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="blog-prose prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-ink-900 prose-h2:mt-12 prose-a:text-brand-700 prose-strong:text-ink-900 prose-img:rounded-xl prose-img:shadow-elevated">
            <BlogMarkdown content={post.content} fallbackAlt={post.title} />
          </div>

          <aside className="mt-14 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-8 text-center shadow-elevated">
            <p className="mb-2 text-2xl font-bold text-white">Trebate ponudu za uvoz?</p>
            <p className="mx-auto mb-6 max-w-md text-brand-100">
              Pošaljite nam zahtjev i odgovorit ćemo u roku od 24 sata s individualnom ponudom.
            </p>
            <Link
              href="/#kontakt"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gold-400"
            >
              Kontaktirajte nas
            </Link>
          </aside>
        </article>

        {others.length > 0 && (
          <section className="border-t border-ink-200 bg-white px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-8 text-2xl font-bold text-ink-900">Ostali članci</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {others.map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
