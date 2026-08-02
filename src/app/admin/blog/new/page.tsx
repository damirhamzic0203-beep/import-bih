import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BlogPostForm } from '@/components/blog-post-form';

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/admin');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink-900">Novi blog post</h1>
      <BlogPostForm />
    </div>
  );
}
