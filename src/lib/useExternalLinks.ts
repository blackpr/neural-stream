'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to ensure all external links in comment HTML have proper attributes
 */
export function useExternalLinks() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const links = ref.current.querySelectorAll('a');
    links.forEach((link) => {
      // Only modify external links
      if (link.hostname && link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }, []);

  return ref;
}
