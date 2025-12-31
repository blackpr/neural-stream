'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

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

export function ReplyCard({ id, author, text, timestamp, replyCount, totalReplyCount, isSelected, onClick, onPreview }: ReplyCardProps & { onPreview?: () => void }) {
  const router = useRouter();
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Handle pointer down for long press detection
  const handlePointerDown = (e: React.PointerEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (onPreview) {
        onPreview();
        // Vibrate if supported for feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms threshold
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // If it was a long press, ignore the click event
    if (isLongPress.current) {
      isLongPress.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

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

      // If Space is pressed, trigger preview instead of navigation if available
      if (key === ' ' && onPreview) {
        onPreview();
        return;
      }
    }

    onClick();
    router.push(`/item/${id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerCancel}
      onClick={handleClick}
      onKeyDown={handleClick}
      onContextMenu={(e) => {
        // Prevent context menu if we just did a long press
        if (isLongPress.current) {
          e.preventDefault();
        }
      }}
      className={`flex-shrink-0 w-96 h-64 p-6 border-2 transition-all duration-200 text-left relative cursor-pointer outline-none select-none ${isSelected
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
          <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${isSelected ? 'from-bg-tertiary' : 'from-bg-secondary'} to-transparent`} />
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="mt-auto pt-2 border-t border-accent-amber/30">
            <div className="flex flex-col gap-1">
              <span className="text-accent-amber text-xs font-mono font-bold animate-pulse">
                HOLD for preview • ENTER to open
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
