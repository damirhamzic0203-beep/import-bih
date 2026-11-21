'use client';

import { useState } from 'react';

/** Naslovna slika s brand gradijentom kao rezervom ako slika ne postoji. */
export function BlogCover({
  src,
  alt = '',
  className = '',
  priority = false,
}: {
  src: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 ${className}`}
    >
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={1200}
          height={630}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
    </div>
  );
}
