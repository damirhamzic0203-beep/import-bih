'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-sm font-medium text-ink-500 hover:text-ink-800"
    >
      Odjava
    </button>
  );
}
