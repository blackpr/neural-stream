'use client';

import { useRouter } from 'next/navigation';

interface StackProps {
  path: Array<{ id: string; title: string }>;
}

export function Stack({ path }: StackProps) {
  const router = useRouter();

  if (path.length === 0) return null;

  return (
    <nav className="border-b border-border-medium bg-bg-secondary px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-sm font-mono overflow-x-auto">
          <button
            onClick={() => router.push('/')}
            className="text-accent-amber hover:text-accent-amber-bright transition-colors whitespace-nowrap"
          >
            HOME
          </button>
          {path.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 animate-fade-in">
              <span className="text-text-muted">/</span>
              <button
                onClick={() => router.push(`/item/${item.id}`)}
                className={`hover:text-accent-amber transition-colors whitespace-nowrap ${index === path.length - 1
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
