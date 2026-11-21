import Link from 'next/link';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { slugify } from '@/lib/site';

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return nodeText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

function stripInline(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim();
}

/** Izvlači h2 naslove (izvan code blokova) za sadržaj članka. */
export function extractH2(content: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inCode = false;
  for (const line of content.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const m = line.match(/^##\s+(.+?)\s*#*\s*$/);
    if (m) {
      const text = stripInline(m[1]);
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}

export function BlogMarkdown({ content, fallbackAlt }: { content: string; fallbackAlt: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Stranica ima tačno jedan h1 (naslov članka) - h1 iz markdowna postaje h2.
        h1: ({ children }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
        h2: ({ children }) => <h2 id={slugify(nodeText(children))}>{children}</h2>,
        a: ({ href, children }) => {
          if (href && href.startsWith('/') && !href.startsWith('//')) {
            return <Link href={href}>{children}</Link>;
          }
          const external = href && /^https?:\/\//i.test(href);
          return (
            <a
              href={href}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {children}
            </a>
          );
        },
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={typeof src === 'string' ? src : undefined}
            alt={alt || fallbackAlt}
            width={1200}
            height={630}
            loading="lazy"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
