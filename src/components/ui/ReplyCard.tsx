'use client';

import { useRouter } from 'next/navigation';

interface ReplyCardProps {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  replyCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function ReplyCard({ id, author, text, timestamp, replyCount, isSelected, onClick }: ReplyCardProps) {
  const router = useRouter();

  // Strip HTML tags for preview
  const plainText = text.replace(/<[^>]*>/g, '');
  const preview = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;

  const handleClick = () => {
    onClick();
    router.push(`/item/${id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex-shrink-0 w-80 h-48 p-6 border-2 transition-all duration-200 text-left ${isSelected
        ? 'border-accent-amber bg-bg-tertiary shadow-[0_0_20px_rgba(255,107,0,0.3)]'
        : 'border-border-medium bg-bg-secondary hover:border-accent-amber-dim'
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Author and Reply Count */}
        <div className="text-sm font-mono mb-3 flex items-center gap-2">
          <span className={isSelected ? 'text-accent-amber font-bold' : 'text-text-secondary'}>
            {author}
          </span>
          {replyCount > 0 && (
            <span className="text-xs text-text-muted">
              • {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Text Preview */}
        <p className="text-text-primary text-sm leading-relaxed flex-1 overflow-hidden font-crimson">
          {preview}
        </p>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-auto pt-3 border-t border-accent-amber">
            <span className="text-accent-amber text-xs font-mono font-bold">
              PRESS ENTER TO DIVE IN →
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
