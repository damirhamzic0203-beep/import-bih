'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setServerError(null);
    setErrors({});

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.details) setErrors(data.details);
      else setServerError(data.message ?? 'Došlo je do greške.');
      return;
    }

    router.push('/login?registered=1');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Registracija klijenta</h1>
        <p className="mt-2 text-sm text-ink-500">
          Kreirajte nalog da zatražite uvoz robe iz Kine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {serverError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Field label="Ime i prezime" error={errors.name}>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            required
          />
        </Field>

        <Field label="Naziv firme" error={errors.companyName}>
          <input
            className="input-field"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            required
          />
        </Field>

        <Field label="JIB / ID broj firme" error={errors.taxId}>
          <input
            className="input-field"
            value={form.taxId}
            onChange={(e) => update('taxId', e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
        </Field>

        <Field label="Telefon" error={errors.phone}>
          <input
            className="input-field"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Adresa" error={errors.address}>
            <input
              className="input-field"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </Field>
          <Field label="Grad" error={errors.city}>
            <input
              className="input-field"
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Lozinka" error={errors.password}>
          <input
            type="password"
            className="input-field"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={8}
          />
        </Field>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Kreiranje naloga…' : 'Registruj se'}
        </button>

        <p className="text-center text-sm text-ink-500">
          Već imate nalog?{' '}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Prijavite se
          </Link>
        </p>
      </form>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-700">{label}</span>
      {children}
      {error?.[0] && <span className="mt-1 block text-xs text-red-600">{error[0]}</span>}
    </label>
  );
}
