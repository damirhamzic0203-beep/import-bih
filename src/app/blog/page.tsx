import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BlogCard } from '@/components/blog-card';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL, SITE_NAME, absUrl } from '@/lib/site';

const TITLE = 'Blog o uvozu iz Kine u BiH — vodiči i savjeti | Import BiH';
const DESCRIPTION =
  'Savjeti, vodiči i vijesti o uvozu robe iz Kine u Bosnu i Hercegovinu: troškovi, carina, transport i izbor dobavljača.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: 'bs_BA',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
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

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
    ],
  };
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog — Import BiH',
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    inLanguage: 'bs',
    isPartOf: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absUrl(`/blog/${p.slug}`),
        name: p.title,
      })),
    },
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd, collectionLd]} />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12 max-w-2xl">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-ink-900">Blog</h1>
          <p className="text-lg text-ink-500">
            Savjeti i vodiči za uvoz robe iz Kine u Bosnu i Hercegovinu.
          </p>
          <div className="mt-4 h-1 w-16 rounded bg-gold-500" />
        </header>

        {posts.length === 0 ? (
          <p className="text-ink-400">Uskoro — pratite nas za prve objave.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
