'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Item page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-bg-secondary border-l-4 border-red-500 p-8 animate-slide-up">
          {/* Error Icon */}
          <div className="text-6xl mb-6 animate-glitch">⚠️</div>

          {/* Error Title */}
          <h1 className="text-3xl font-bold mb-4">
            STREAM INTERRUPTED
          </h1>

          {/* Error Message */}
          <p className="text-text-secondary font-crimson text-lg mb-8 leading-relaxed">
            {error.message || 'Failed to load this item. It may have been deleted or the connection was lost.'}
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="px-6 py-3 bg-accent-amber text-bg-primary font-bold font-mono hover:bg-accent-amber-bright transition-colors"
            >
              RETRY
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-border-medium text-text-primary font-mono hover:border-accent-amber transition-colors"
            >
              RETURN HOME
            </button>
          </div>

          {/* Debug Info */}
          {error.digest && (
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <p className="text-xs text-text-muted font-mono">
                ERROR ID: {error.digest}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
