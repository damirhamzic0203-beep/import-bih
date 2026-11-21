import Link from 'next/link';
import { BlogCover } from '@/components/blog-cover';

export interface BlogCardPost {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
  tags: string[];
}

export function BlogCard({ post }: { post: BlogCardPost }) {
  const href = `/blog/${post.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-elevated">
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <BlogCover
          src={post.coverImage ?? post.featuredImage}
          className="aspect-[1200/630] w-full rounded-t-2xl"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <h2 className="mb-2 text-lg font-bold leading-snug text-ink-900">
          <Link href={href} className="transition-colors group-hover:text-brand-700">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <span className="text-ink-400">
            {post.publishedAt?.toLocaleDateString('bs-BA')}
          </span>
          <Link href={href} className="font-semibold text-brand-700 hover:underline">
            Pročitaj više →
          </Link>
        </div>
      </div>
    </article>
  );
}
