'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape key - go to homepage
      if (e.key === 'Escape') {
        e.preventDefault();
        router.push('/');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
