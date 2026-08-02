import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { FaqAccordion } from '@/components/faq-accordion';
import { ContactForm } from '@/components/contact-form';
import Link from 'next/link';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 3v18" />
      <rect x="13" y="13" width="4" height="8" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 2L3 7v6c0 4.97 4.02 9.44 9 11 4.98-1.56 9-6.03 9-11V7L12 2z" />
      <polyline points="9,12 11,14 15,10" />
    </svg>
  );
}

function IconShip() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M2 21h20M5 21V10.5L12 7l7 3.5V21" />
      <path d="M12 7V3M8.5 21v-6h7v6" />
      <path d="M9 13h6" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

// ─── Stat icons ───────────────────────────────────────────────────────────────

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}

// ─── Hero Illustration (UNCHANGED) ────────────────────────────────────────────

function HeroIllustration() {
  return (
    <div className="relative flex w-full items-center justify-center" style={{ minHeight: 440 }}>
      <svg
        viewBox="0 0 520 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-lg"
        aria-hidden="true"
      >
        <ellipse cx="170" cy="200" rx="140" ry="110" fill="rgba(20,120,168,0.18)" />
        <ellipse cx="360" cy="190" rx="120" ry="95" fill="rgba(75,172,217,0.12)" />
        <ellipse cx="260" cy="140" rx="80" ry="60" fill="rgba(236,201,75,0.06)" />
        <defs>
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.07)" />
          </pattern>
        </defs>
        <rect x="30" y="30" width="460" height="340" fill="url(#dots)" />
        <path d="M 100 230 C 160 100 360 100 420 230" stroke="rgba(28,146,201,0.35)"
          strokeWidth="1.5" strokeDasharray="8 6" fill="none" />
        <circle r="5" fill="rgba(28,146,201,0.8)">
          <animateMotion dur="4s" repeatCount="indefinite">
            <mpath href="#routePath" />
          </animateMotion>
        </circle>
        <path id="routePath" d="M 100 230 C 160 100 360 100 420 230" fill="none" />
        <path d="M 410 223 L 420 230 L 410 237" stroke="#1c92c9" strokeWidth="1.5"
          fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy="230" r="32" fill="rgba(14,96,137,0.12)" />
        <circle cx="100" cy="230" r="20" fill="rgba(14,96,137,0.28)" />
        <circle cx="100" cy="230" r="10" fill="#0e6089" />
        <circle cx="100" cy="230" r="4" fill="#8ccae7" />
        <text x="100" y="276" textAnchor="middle" fill="rgba(140,202,231,0.9)"
          fontSize="12" fontFamily="system-ui,sans-serif" fontWeight="700">Shanghai</text>
        <text x="100" y="290" textAnchor="middle" fill="rgba(140,202,231,0.5)"
          fontSize="10" fontFamily="system-ui,sans-serif">Kina</text>
        <circle cx="420" cy="230" r="32" fill="rgba(75,172,217,0.12)" />
        <circle cx="420" cy="230" r="20" fill="rgba(75,172,217,0.22)" />
        <circle cx="420" cy="230" r="10" fill="#1478a8" />
        <circle cx="420" cy="230" r="4" fill="#c3e3f2" />
        <text x="420" y="276" textAnchor="middle" fill="rgba(140,202,231,0.9)"
          fontSize="12" fontFamily="system-ui,sans-serif" fontWeight="700">Sarajevo</text>
        <text x="420" y="290" textAnchor="middle" fill="rgba(140,202,231,0.5)"
          fontSize="10" fontFamily="system-ui,sans-serif">BiH</text>
        <g transform="translate(234, 82)">
          <path d="M 1 20 L 0 25 L 52 25 L 51 20 Z" fill="rgba(20,120,168,0.6)" stroke="#1c92c9" strokeWidth="1" />
          <rect x="7" y="11" width="38" height="9" rx="1" fill="rgba(14,96,137,0.65)" stroke="#1c92c9" strokeWidth="1" />
          <rect x="9" y="13" width="10" height="6" rx="0.5" fill="rgba(75,172,217,0.65)" />
          <rect x="21" y="13" width="10" height="6" rx="0.5" fill="rgba(28,146,201,0.55)" />
          <rect x="33" y="13" width="9" height="6" rx="0.5" fill="rgba(75,172,217,0.45)" />
          <rect x="36" y="4" width="6" height="7" rx="1" fill="rgba(20,120,168,0.75)" stroke="#1c92c9" strokeWidth="0.75" />
          <circle cx="39" cy="2" r="2.5" fill="rgba(140,202,231,0.18)" />
          <circle cx="42" cy="0" r="1.8" fill="rgba(140,202,231,0.12)" />
        </g>
        <circle cx="260" cy="143" r="5" fill="rgba(236,201,75,0.7)" />
        <circle cx="260" cy="143" r="10" fill="rgba(236,201,75,0.15)" />
        <rect x="130" y="318" width="260" height="52" rx="10"
          fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="143" y="331" width="120" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
        <rect x="143" y="331" width="80" height="4" rx="2" fill="rgba(28,146,201,0.7)" />
        <circle cx="143" cy="351" r="3" fill="rgba(28,146,201,0.8)" />
        <circle cx="175" cy="351" r="3" fill="rgba(28,146,201,0.8)" />
        <circle cx="207" cy="351" r="3" fill="rgba(28,146,201,0.8)" />
        <circle cx="239" cy="351" r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx="271" cy="351" r="3" fill="rgba(255,255,255,0.2)" />
        <line x1="146" y1="351" x2="172" y2="351" stroke="rgba(28,146,201,0.5)" strokeWidth="1" />
        <line x1="178" y1="351" x2="204" y2="351" stroke="rgba(28,146,201,0.5)" strokeWidth="1" />
        <line x1="210" y1="351" x2="236" y2="351" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="242" y1="351" x2="268" y2="351" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <text x="353" y="345" textAnchor="end" fill="rgba(140,202,231,0.6)"
          fontSize="9" fontFamily="system-ui,sans-serif" letterSpacing="0.04em">U TRANZITU</text>
        <text x="353" y="357" textAnchor="end" fill="rgba(140,202,231,0.35)"
          fontSize="8" fontFamily="system-ui,sans-serif">Beograd → Sarajevo</text>
      </svg>
      <div className="pointer-events-none absolute left-0 top-6 flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/80 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px]">✓</span>
        <span className="text-ink-300">IMP-2026-000142</span>
        <span className="text-emerald-400">Dostavljeno</span>
      </div>
      <div className="pointer-events-none absolute right-2 top-1/3 flex items-center gap-2 rounded-full border border-white/15 bg-ink-900/80 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-brand-400"></span>
        <span className="text-ink-300">IMP-2026-000156</span>
        <span className="text-brand-300">U tranzitu</span>
      </div>
      <div className="pointer-events-none absolute bottom-16 right-4 flex items-center gap-2 rounded-full border border-gold-500/30 bg-ink-900/80 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
        <span className="text-gold-400">★</span>
        <span className="text-ink-300">Provjera kvaliteta</span>
        <span className="text-gold-400">Prošlo</span>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    n: '01', Icon: IconSearch, label: 'Sourcing',
    desc: 'Pronalazimo pouzdane dobavljače na tržištu Kine, Vijetnama i Indije prema vašim specifikacijama.',
    sub: 'Pristup mreži od 10.000+ verificiranih fabrika i veletrgovaca.',
    color: 'from-brand-600 to-brand-800',
  },
  {
    n: '02', Icon: IconBuilding, label: 'Provjera dobavljača',
    desc: 'Auditujemo i verificiramo svakog dobavljača prije potpisivanja ugovora ili prijenosa sredstava.',
    sub: 'Inspekcija licence, kapaciteta i referenci — bez plaćanja unaprijed.',
    color: 'from-brand-700 to-brand-900',
  },
  {
    n: '03', Icon: IconShield, label: 'Kontrola kvaliteta',
    desc: 'Inspekcija robe direktno u fabrici eliminiše rizik lošeg kvaliteta još na izvoru.',
    sub: 'Fotodokumentacija, uzorkovanje i pismeni izvještaj sa svakom inspekcijom.',
    color: 'from-brand-600 to-brand-800',
  },
  {
    n: '04', Icon: IconShip, label: 'Međunarodni transport',
    desc: 'More, zrak, željeznica ili kamion — biramo najoportuniju rutu za vaš teret i rok isporuke.',
    sub: 'Fulltracking od utovara do carinskog terminala u BiH.',
    color: 'from-brand-700 to-brand-900',
  },
  {
    n: '05', Icon: IconClipboard, label: 'Carina i špedicija',
    desc: 'Kompletna carinska dokumentacija i zastupanje kod carinskih organa Bosne i Hercegovine.',
    sub: 'Nikad iznenađenje na carini — sve PDV i uvozne dažbine obračunate unaprijed.',
    color: 'from-brand-600 to-brand-800',
  },
  {
    n: '06', Icon: IconTruck, label: 'Dostava u BiH',
    desc: 'Door-to-door dostava na vašu adresu bez ikakve koordinacije s vaše strane.',
    sub: 'Pokrivamo sve kantone FBiH, RS i Brčko distrikt.',
    color: 'from-brand-700 to-brand-900',
  },
];

const STATS = [
  { value: '500+', label: 'Uspješnih uvoza',     sub: 'od 2019. godine',       Icon: IconBox        },
  { value: '98%',  label: 'Isporuka na vrijeme', sub: 'garantovano ugovorom',  Icon: IconClock      },
  { value: '15+',  label: 'Zemalja dobavljača',  sub: 'Azija, EU i šire',      Icon: IconGlobe      },
  { value: '24/7', label: 'Podrška klijentima',  sub: 'uvijek dostupni',        Icon: IconHeadphones },
];

const PROCESS_STEPS = [
  { n: '01', title: 'Pošaljite zahtjev',      desc: 'Opišite šta želite uvesti — naziv, fotografiju ili link. Naš tim preuzima sve ostalo.' },
  { n: '02', title: 'Pronalazimo dobavljača', desc: 'Identifikujemo i verificiramo dobavljače, pregovaramo cijenu i uslove isporuke.' },
  { n: '03', title: 'Kontrola kvaliteta',     desc: 'Inspekcija robe u fabrici prije otpreme — eliminišemo rizik lošeg kvaliteta.' },
  { n: '04', title: 'Transport i carina',     desc: 'Organizujemo međunarodni transport i brinemo se o kompletnoj carinskoj dokumentaciji.' },
  { n: '05', title: 'Dostava na adresu',      desc: 'Roba stiže direktno na vaša vrata uz potpunu pratnju i realtime tracking.' },
];

const TESTIMONIALS = [
  {
    initials: 'MH', name: 'Mirza Hadžić', company: 'TechRetail d.o.o.', rating: 5,
    quote: 'Import BiH je promijenio način na koji nabavljamo robu iz Kine. Carinska dokumentacija, tracking, komunikacija s dobavljačem — sve je riješeno bez naše intervencije.',
  },
  {
    initials: 'AK', name: 'Amra Kovačević', company: 'HomeDecor BH', rating: 5,
    quote: 'Tri puta smo pokušali sami uvoziti i svaki put imali problema s carinom. S Import BiH — nula problema, roba je stigla na vrijeme i bez iznenađenja.',
  },
  {
    initials: 'DM', name: 'Davor Marković', company: 'Gradnja Plus', rating: 5,
    quote: 'Uvozimo građevinski materijal iz Kine svakog kvartala. Pouzdanost i transparentnost cijene su ono što nas drži lojalnim klijentima.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="antialiased">
      <SiteHeader />

      {/* ══ HERO — UNCHANGED ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-24 md:py-28"
        style={{ background: 'linear-gradient(135deg, #0b1220 0%, #04263a 45%, #063a56 70%, #0a4d70 100%)' }}>
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
        <div className="pointer-events-none absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full bg-brand-800 opacity-[0.18] blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-brand-700 opacity-[0.14] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500 opacity-[0.04] blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:items-center md:gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-600/40 bg-brand-900/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-300">
              <span>🇨🇳</span>
              <span>Kina → Bosna i Hercegovina</span>
              <span>🇧🇦</span>
            </div>
            <h1 className="text-5xl font-bold leading-[1.06] tracking-tight text-white md:text-6xl lg:text-7xl">
              Uvoz iz Kine
              <br />
              <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-gold-400 bg-clip-text text-transparent">
                bez komplikacija.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ink-300 md:mx-0">
              Od pronalaska dobavljača i kontrole kvaliteta do transporta, carine i dostave na
              vašu adresu — sve na jednom mjestu, sa jednim odgovornim timom.
            </p>
            <ul className="mx-auto mt-6 space-y-2 text-sm text-ink-400 md:mx-0">
              {['Besplatna procjena i ponuda', 'Bez skrivenih troškova', '500+ uspješnih uvoza'].map((item) => (
                <li key={item} className="flex items-center justify-center gap-2 md:justify-start">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600/30 text-brand-400">
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/register"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-brand-900/50 transition hover:from-brand-500 hover:to-brand-400">
                Zatražite ponudu besplatno
              </Link>
              <a href="#kako-funkcionise"
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/20 bg-white/6 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/12">
                Kako funkcioniše →
              </a>
            </div>
          </div>
          <div className="relative flex w-full flex-1 items-center justify-center md:justify-end">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ══ BROJKE KOJE GOVORE — ENHANCED ════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-24"
        style={{ background: 'linear-gradient(135deg, #0b1220 0%, #04263a 50%, #0b1220 100%)' }}>

        {/* Blur orbs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-[350px] w-[350px] rounded-full bg-brand-700 opacity-[0.12] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[300px] w-[300px] rounded-full bg-brand-500 opacity-[0.08] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500 opacity-[0.04] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">Rezultati</p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Brojke koje govore
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-px bg-white/[0.06] lg:grid-cols-4">
            {STATS.map(({ value, label, sub, Icon }, i) => (
              <div key={label}
                className="group flex flex-col items-center px-6 py-10 text-center transition duration-300 hover:bg-white/[0.04]"
                style={{ background: i % 2 === 0 ? 'rgba(10,77,112,0.15)' : 'rgba(4,38,58,0.2)' }}>

                {/* Icon */}
                <div className="mb-4 text-brand-400 opacity-70 transition duration-300 group-hover:opacity-100">
                  <Icon />
                </div>

                {/* Gradient number */}
                <span className="bg-gradient-to-r from-brand-200 to-brand-400 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent md:text-7xl">
                  {value}
                </span>

                <span className="mt-3 text-sm font-semibold text-brand-300">{label}</span>
                <span className="mt-1 text-xs text-ink-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ USLUGE — ENHANCED ════════════════════════════════════════════════ */}
      <section id="usluge" className="relative overflow-hidden px-6 py-24 md:py-28"
        style={{ background: 'linear-gradient(180deg, #e6f4fa 0%, #ffffff 35%)' }}>

        {/* Subtle orb */}
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-100 opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-50 opacity-60 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">Šta radimo</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
              Jedan partner. Cijeli proces uvoza.
            </h2>
            <p className="mt-4 text-base text-ink-500">
              Preuzimamo sve faze uvoznog procesa — od ideje do isporuke na vaša vrata.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ n, Icon, label, desc, sub, color }, i) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-7 shadow-card transition duration-300 hover:-translate-y-2 hover:border-brand-300 hover:shadow-xl ${i % 3 === 1 ? 'lg:translate-y-6' : ''}`}
              >
                {/* Decorative background number */}
                <span className="pointer-events-none absolute -right-2 -top-4 select-none text-[100px] font-black leading-none text-brand-600 opacity-[0.06] transition duration-300 group-hover:opacity-[0.1]">
                  {n}
                </span>

                {/* Gradient icon */}
                <div className={`relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg transition duration-300 group-hover:shadow-brand-500/30`}>
                  <Icon />
                </div>

                <h3 className="mb-2 text-base font-bold text-ink-900">{label}</h3>
                <p className="text-sm leading-relaxed text-ink-600">{desc}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-400">{sub}</p>

                {/* Animated bottom border */}
                <div className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 rounded-b-2xl bg-gradient-to-r from-brand-500 to-brand-400 transition duration-500 group-hover:scale-x-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ KAKO FUNKCIONIŠE — DARK, ENHANCED ═══════════════════════════════ */}
      <section id="kako-funkcionise" className="relative overflow-hidden px-6 py-24 md:py-28"
        style={{ background: 'linear-gradient(135deg, #0b1220 0%, #04263a 50%, #063a56 100%)' }}>

        {/* Dot grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]" aria-hidden="true">
          <defs>
            <pattern id="procdots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#procdots)" />
        </svg>

        {/* Blur orbs */}
        <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-brand-800 opacity-[0.2] blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-brand-700 opacity-[0.15] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">Proces</p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Pet koraka do vaše robe
            </h2>
            <p className="mt-4 text-base text-ink-400">
              Jasno, transparentno, bez iznenađenja — od zahtjeva do dostave.
            </p>
          </div>

          {/* Desktop: 5-column layout with glowing SVG connector */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Glowing SVG connector */}
              <svg
                className="pointer-events-none absolute left-0 top-7 w-full"
                height="6"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="procLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1478a8" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#4bacd9" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#1478a8" stopOpacity="0.5" />
                  </linearGradient>
                  <filter id="lineGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 10% 3 L 90% 3"
                  stroke="url(#procLineGrad)"
                  strokeWidth="2"
                  strokeDasharray="8 5"
                  filter="url(#lineGlow)"
                  fill="none"
                />
              </svg>

              <div className="grid grid-cols-5 gap-4">
                {PROCESS_STEPS.map((step) => (
                  <div key={step.n} className="group flex flex-col items-center text-center">
                    {/* Glowing numbered circle */}
                    <div
                      className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-black text-white transition duration-300 group-hover:scale-110"
                      style={{ boxShadow: '0 0 28px rgba(28,146,201,0.45)' }}
                    >
                      {step.n}
                    </div>

                    {/* Glass card */}
                    <div className="mt-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition duration-300 group-hover:border-brand-700/50 group-hover:bg-white/[0.09]"
                      style={{ boxShadow: '0 0 0 0 rgba(28,146,201,0)' }}>
                      <h3 className="text-sm font-bold text-white">{step.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical list */}
          <div className="relative flex flex-col gap-0 md:hidden">
            <svg className="pointer-events-none absolute left-7 top-0 h-full w-4" aria-hidden="true">
              <defs>
                <linearGradient id="vProcGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1c92c9" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#4bacd9" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <line x1="8" y1="28" x2="8" y2="100%" stroke="url(#vProcGrad)" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
            {PROCESS_STEPS.map((step) => (
              <div key={step.n} className="relative flex items-start gap-5 pb-10 last:pb-0">
                <div
                  className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-black text-white"
                  style={{ boxShadow: '0 0 24px rgba(28,146,201,0.4)' }}
                >
                  {step.n}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/register"
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-10 py-3 text-sm font-bold text-white shadow-xl shadow-brand-900/60 transition hover:from-brand-400 hover:to-brand-600 hover:shadow-2xl"
            >
              Pokrenite uvoz danas
            </Link>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS — ENHANCED ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-24 md:py-28"
        style={{ background: 'linear-gradient(135deg, #04263a 0%, #0b1220 50%, #063a56 100%)' }}>

        {/* Orbs */}
        <div className="pointer-events-none absolute left-0 top-1/4 h-[400px] w-[400px] rounded-full bg-brand-700 opacity-[0.1] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-brand-500 opacity-[0.07] blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">Klijenti</p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Šta kažu naši klijenti
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-brand-700/50 hover:bg-white/[0.10] hover:shadow-xl hover:shadow-brand-900/30"
              >
                {/* Colored top border */}
                <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-brand-500 to-brand-400" />

                {/* Decorative quote mark */}
                <span className="pointer-events-none absolute right-5 top-4 select-none text-[80px] font-serif leading-none text-brand-500 opacity-[0.12] transition duration-300 group-hover:opacity-[0.2]">
                  &ldquo;
                </span>

                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="text-gold-400 text-sm">★</span>
                  ))}
                </div>

                <p className="relative flex-1 text-sm leading-relaxed text-ink-300">{t.quote}</p>

                <div className="mt-6 flex items-center gap-3 border-t border-white/8 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white ring-2 ring-brand-600/30">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-ink-400">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="bg-ink-50 px-6 py-24 md:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">FAQ</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
              Često postavljana pitanja
            </h2>
            <p className="mt-4 text-base text-ink-500">
              Sve što trebate znati o uvozu iz Kine — na jednom mjestu.
            </p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* ══ KONTAKT ═══════════════════════════════════════════════════════════ */}
      <section id="kontakt" className="bg-white px-6 py-24 md:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">Kontakt</p>
            <h2 className="text-3xl font-bold tracking-tight text-ink-900 md:text-4xl">
              Kontaktirajte nas
            </h2>
            <p className="mt-4 text-base text-ink-500">
              Imate pitanje ili poseban zahtjev? Odgovorit ćemo u roku od 24 sata.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ══ FINAL CTA — ENHANCED ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-28 md:py-32"
        style={{ background: 'linear-gradient(135deg, #04263a 0%, #063a56 30%, #0a4d70 65%, #0b1220 100%)' }}>

        {/* Dot grid */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden="true">
          <defs>
            <pattern id="ctadots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctadots)" />
        </svg>

        {/* Blur orbs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-brand-700 opacity-[0.18] blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[450px] w-[450px] rounded-full bg-gold-500 opacity-[0.06] blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 opacity-[0.08] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-400">
            Počnite danas
          </p>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Spremni za uvoz
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-gold-400 bg-clip-text text-transparent">
              bez stresa?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Više od 500 firmi iz BiH već uvozi s nama. Registrujte se besplatno,
            opišite šta trebate — i prepustite nam ostatak.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 px-10 py-4 text-base font-bold text-white shadow-2xl shadow-brand-950/70 transition hover:from-brand-400 hover:to-brand-300 hover:shadow-[0_0_40px_rgba(28,146,201,0.45)]"
            >
              Zatražite besplatnu ponudu
            </Link>
            <a
              href="#kontakt"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl border border-white/20 bg-white/8 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Kontaktirajte nas
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-500">
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400">✓</span> Bez troškova registracije
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400">✓</span> Ponuda u roku 24h
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-brand-400">✓</span> Bez obaveza
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
