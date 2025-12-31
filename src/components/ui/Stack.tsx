'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StackProps {
  path: Array<{ id: string; title: string }>;
}

export function Stack({ path }: StackProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the right when path changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [path]);

  // Enable horizontal scrolling with mouse wheel
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        // Prevent default vertical scroll and scroll horizontally instead
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (path.length === 0) return null;

  return (
    <nav className="border-b border-border-medium bg-bg-secondary px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div
          ref={containerRef}
          className="flex items-center gap-2 text-sm font-mono overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            onClick={() => router.push('/')}
            className="text-accent-amber hover:text-accent-amber-bright transition-colors flex-shrink-0"
          >
            HOME
          </button>
          {path.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 animate-fade-in flex-shrink-0">
              <span className="text-text-muted">/</span>
              <button
                onClick={() => router.push(`/item/${item.id}`)}
                className={`hover:text-accent-amber transition-colors ${index === path.length - 1
                  ? 'text-text-primary font-bold'
                  : 'text-text-secondary'
                  }`}
              >
                {item.title.length > 40
                  ? item.title.substring(0, 40) + '...'
                  : item.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
