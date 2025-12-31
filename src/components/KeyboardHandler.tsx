'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardHandler() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape key - go back
      if (e.key === 'Escape') {
        e.preventDefault();
        router.back();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
