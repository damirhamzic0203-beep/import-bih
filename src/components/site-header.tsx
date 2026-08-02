import Link from 'next/link';
import { Logo } from '@/components/logo';

export function SiteHeader() {
  return (
    <header className="border-b border-ink-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo variant="dark" size="md" />
        <nav className="hidden gap-6 text-sm font-medium text-ink-600 md:flex">
          <Link href="/#kako-funkcionise" className="hover:text-ink-900">Kako funkcioniše</Link>
          <Link href="/#usluge" className="hover:text-ink-900">Naše usluge</Link>
          <Link href="/#faq" className="hover:text-ink-900">FAQ</Link>
          <Link href="/o-nama" className="hover:text-ink-900">O nama</Link>
          <Link href="/blog" className="hover:text-ink-900">Blog</Link>
          <Link href="/#kontakt" className="hover:text-ink-900">Kontakt</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900">
            Prijava
          </Link>
          <Link href="/register" className="btn-primary">
            Zatražite ponudu
          </Link>
        </div>
      </div>
    </header>
  );
}
