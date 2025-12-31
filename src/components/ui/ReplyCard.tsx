'use client';

import { useRouter } from 'next/navigation';

interface ReplyCardProps {
  id: string;
  author: string;
  text: string;
  timestamp: number;
  replyCount: number;
  totalReplyCount?: number;
  isSelected: boolean;
  onClick: () => void;
}

export function ReplyCard({ id, author, text, timestamp, replyCount, totalReplyCount, isSelected, onClick }: ReplyCardProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Prevent event bubbling if clicking a link within the content
    const target = e.target as HTMLElement;
    if (target.closest('a')) {
      e.stopPropagation();
      return;
    }

    if (e.type === 'keydown') {
      const key = (e as React.KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      e.preventDefault(); // Prevent page scroll on Space
    }

    onClick();
    router.push(`/item/${id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleClick}
      className={`flex-shrink-0 w-80 h-48 p-6 border-2 transition-all duration-200 text-left relative cursor-pointer outline-none ${isSelected
        ? 'border-accent-amber bg-bg-tertiary shadow-[0_0_20px_rgba(255,107,0,0.3)]'
        : 'border-border-medium bg-bg-secondary hover:border-accent-amber-dim'
        }`}
    >
      <div className="flex flex-col h-full pointer-events-none">
        {/* Author and Reply Count */}
        <div className="text-sm font-mono mb-2 flex items-center gap-2">
          <span className={isSelected ? 'text-accent-amber font-bold' : 'text-text-secondary'}>
            {author}
          </span>
          {(replyCount > 0) && (
            <span className="text-xs text-text-muted">
              • {totalReplyCount !== undefined && totalReplyCount > replyCount
                ? `${replyCount} direct`
                : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
              }
            </span>
          )}
        </div>

        {/* Text Preview */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="prose prose-invert prose-sm max-w-none font-crimson text-text-primary leading-relaxed text-sm pointer-events-auto"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          {/* Fade out gradient at bottom */}
          <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${isSelected ? 'from-bg-tertiary' : 'from-bg-secondary'} to-transparent`} />
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-auto pt-2 border-t border-accent-amber/30">
            <div className="flex flex-col gap-1">
              <span className="text-accent-amber text-xs font-mono font-bold animate-pulse">
                SPACE to preview • ENTER to open
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
