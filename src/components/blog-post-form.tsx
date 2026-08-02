'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[šs]/g, 's')
    .replace(/[žz]/g, 'z')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface DefaultValues {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  seoTitle?: string;
  metaDescription?: string;
  categories?: string;
  tags?: string;
  status?: string;
}

interface Props {
  postId?: string;
  defaultValues?: DefaultValues;
}

export function BlogPostForm({ postId, defaultValues }: Props) {
  const router = useRouter();
  const isEdit = !!postId;

  const [form, setForm] = useState({
    title: defaultValues?.title ?? '',
    slug: defaultValues?.slug ?? '',
    content: defaultValues?.content ?? '',
    excerpt: defaultValues?.excerpt ?? '',
    featuredImage: defaultValues?.featuredImage ?? '',
    seoTitle: defaultValues?.seoTitle ?? '',
    metaDescription: defaultValues?.metaDescription ?? '',
    categories: defaultValues?.categories ?? '',
    tags: defaultValues?.tags ?? '',
    status: defaultValues?.status ?? 'DRAFT',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleTitleChange(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEdit ? prev.slug : slugify(value),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      excerpt: form.excerpt || null,
      featuredImage: form.featuredImage || null,
      seoTitle: form.seoTitle || null,
      metaDescription: form.metaDescription || null,
      categories: form.categories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      tags: form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status: form.status,
    };

    const url = isEdit ? `/api/blog/${postId}` : '/api/blog';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? 'Greška pri čuvanju posta.');
      return;
    }

    router.push('/admin/blog');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Naslov *</label>
        <input
          required
          className="input-field"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Slug *</label>
        <input
          required
          className="input-field font-mono text-sm"
          value={form.slug}
          onChange={(e) => set('slug', e.target.value)}
        />
        <p className="mt-1 text-xs text-ink-400">
          URL: /blog/{form.slug || '…'}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Sadržaj *</label>
        <textarea
          required
          rows={16}
          className="input-field resize-y font-mono text-sm"
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Kratak opis (excerpt)</label>
        <textarea
          rows={3}
          className="input-field resize-none"
          value={form.excerpt}
          onChange={(e) => set('excerpt', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">URL slike (featured image)</label>
          <input
            type="url"
            className="input-field"
            value={form.featuredImage}
            onChange={(e) => set('featuredImage', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Status</label>
          <select
            className="input-field"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          >
            <option value="DRAFT">Nacrt</option>
            <option value="PUBLISHED">Objavljeno</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">SEO naslov</label>
          <input
            className="input-field"
            value={form.seoTitle}
            onChange={(e) => set('seoTitle', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Meta opis</label>
          <input
            className="input-field"
            value={form.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Kategorije (odvojene zarezom)</label>
          <input
            className="input-field"
            placeholder="npr. Vodič, Transport"
            value={form.categories}
            onChange={(e) => set('categories', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Tagovi (odvojeni zarezom)</label>
          <input
            className="input-field"
            placeholder="npr. uvoz, kina, carina"
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Čuvam...' : isEdit ? 'Sačuvaj izmjene' : 'Kreiraj post'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.push('/admin/blog')}
        >
          Odustani
        </button>
      </div>
    </form>
  );
}
