import Link from 'next/link';

interface Props {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const sizes = {
  sm: { badge: 26, text: 'text-base', gap: 'gap-2' },
  md: { badge: 30, text: 'text-xl', gap: 'gap-2.5' },
  lg: { badge: 36, text: 'text-2xl', gap: 'gap-3' },
};

function ContainerIcon({ size }: { size: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-800"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Container front face */}
        <rect x="4.5" y="7.5" width="14" height="12.5" rx="2" stroke="white" strokeWidth="1.7" fill="none" />
        {/* Lid / top stripe */}
        <line x1="4.5" y1="11.5" x2="18.5" y2="11.5" stroke="white" strokeWidth="1.7" />
        {/* Door seam (center divider) */}
        <line x1="11.5" y1="11.5" x2="11.5" y2="20" stroke="white" strokeWidth="1.1" strokeOpacity="0.4" />
        {/* Route arrow — diagonal, pointing up-right */}
        <path d="M21 21.5L26.5 12" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
        {/* Arrowhead */}
        <path d="M23 10.5L26.5 12L25.5 15.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function Logo({ variant = 'dark', size = 'md', href = '/' }: Props) {
  const { badge, text, gap } = sizes[size];

  const wordColor = variant === 'dark' ? 'text-ink-900' : 'text-white';
  const accentColor = variant === 'dark' ? 'text-gold-600' : 'text-gold-400';

  return (
    <Link href={href} className={`flex items-center ${gap}`}>
      <ContainerIcon size={badge} />
      <span className={`${text} font-bold leading-none tracking-tight`}>
        <span className={wordColor}>Import</span>
        <span className={accentColor}> BiH</span>
      </span>
    </Link>
  );
}
