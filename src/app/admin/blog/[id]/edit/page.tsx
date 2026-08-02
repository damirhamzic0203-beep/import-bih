import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BlogPostForm } from '@/components/blog-post-form';

interface Props {
  params: { id: string };
}

export default async function EditBlogPostPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/admin');

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Uredi post</h1>
      <BlogPostForm
        postId={post.id}
        defaultValues={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt ?? '',
          featuredImage: post.featuredImage ?? '',
          seoTitle: post.seoTitle ?? '',
          metaDescription: post.metaDescription ?? '',
          categories: post.categories.join(', '),
          tags: post.tags.join(', '),
          status: post.status,
        }}
      />
    </div>
  );
}
