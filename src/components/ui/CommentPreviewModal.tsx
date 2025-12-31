'use client';

import { useEffect } from 'react';
import { Comment } from '@/domain/entities/Comment';

interface CommentPreviewModalProps {
  comment: Comment;
  onClose: () => void;
  onNavigate: () => void;
}

export function CommentPreviewModal({ comment, onClose, onNavigate }: CommentPreviewModalProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        onNavigate();
      } else if (e.key === 'Escape') {
        // Close modal and stop propagation to prevent page navigation
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }

    // Use capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, onNavigate]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'just now';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[80vh] m-6 bg-bg-secondary border-2 border-accent-amber shadow-[0_0_40px_rgba(255,107,0,0.4)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-border-medium bg-bg-tertiary px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-accent-amber font-bold font-mono">
                  {comment.author}
                </span>
                <span className="text-text-muted text-sm font-mono">
                  {formatTime(comment.timestamp)}
                </span>
              </div>
              {comment.childIds.length > 0 && (
                <p className="text-xs text-text-secondary font-mono mt-1">
                  {comment.totalReplyCount !== undefined && comment.totalReplyCount > comment.childIds.length
                    ? `${comment.childIds.length} direct (${comment.totalReplyCount} total)`
                    : `${comment.childIds.length} ${comment.childIds.length === 1 ? 'reply' : 'replies'}`
                  }
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center border border-border-medium hover:border-accent-amber transition-colors"
              aria-label="Close preview"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-180px)] px-6 py-6">
          <div
            className="prose prose-invert max-w-none font-crimson text-text-primary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: comment.text }}
          />
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-border-medium bg-bg-tertiary px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-xs font-mono text-text-muted">
              <span>SPACE or ESC to close</span>
            </div>
            <button
              onClick={onNavigate}
              className="px-4 py-2 bg-accent-amber text-bg-primary font-mono font-bold text-sm hover:bg-accent-amber-bright transition-colors"
            >
              ENTER TO VIEW FULL THREAD →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
