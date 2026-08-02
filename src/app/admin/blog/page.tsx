import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') redirect('/admin');

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">Blog</h1>
        <Link href="/admin/blog/new" className="btn-primary">
          + Novi post
        </Link>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-ink-100">
          <thead className="bg-ink-50">
            <tr>
              {['Naslov', 'Status', 'Autor', 'Datum', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-400">
                  Nema blog postova.
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50">
                <td className="px-4 py-3 text-sm font-medium text-ink-900">{p.title}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {p.status === 'PUBLISHED' ? 'Objavljeno' : 'Nacrt'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-600">{p.author?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-ink-500">
                  {p.publishedAt
                    ? p.publishedAt.toLocaleDateString('bs-BA')
                    : p.createdAt.toLocaleDateString('bs-BA')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/blog/${p.id}/edit`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Uredi
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
