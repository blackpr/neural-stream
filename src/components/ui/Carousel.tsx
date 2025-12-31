'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Comment } from '@/domain/entities/Comment';
import { ReplyCard } from './ReplyCard';
import { CommentPreviewModal } from './CommentPreviewModal';
import { HNApiMapper } from '@/infrastructure/mappers/HNApiMapper';
import { useRouter } from 'next/navigation';
import { getStoredCommentFocusIndex, setStoredCommentFocusIndex } from '@/infrastructure/storage/NavigationStorage';

interface CarouselProps {
  childIds: string[];
  parentId: string | number;
}

/* Use an extended type locally to include the total count */
function CarouselContent({ childIds, parentId }: CarouselProps) {

  const [selectedIndex, setSelectedIndex] = useState(() => {
    return getStoredCommentFocusIndex(parentId);
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewComment, setPreviewComment] = useState<Comment | null>(null);

  // Persist focus index
  useEffect(() => {
    setStoredCommentFocusIndex(parentId, selectedIndex);
  }, [selectedIndex, parentId]);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const fetchedComments = await Promise.all(
          childIds.map(async (id) => {
            try {
              // Try Algolia first to get the full tree stats
              const response = await fetch(`https://hn.algolia.com/api/v1/items/${id}`);
              if (!response.ok) throw new Error('Algolia fetch failed');
              const data = await response.json();
              return HNApiMapper.fromAlgolia(data) as Comment;
            } catch (err) {
              // Fallback to Firebase if Algolia fails or is delayed
              const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
              const data = await response.json();
              return HNApiMapper.toStreamNode(data) as Comment;
            }
          })
        );
        // Filter out deleted comments - use type guard or safe access
        setComments(fetchedComments.filter((c) => !('isDeleted' in c) || !c.isDeleted));
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    }

    if (childIds.length > 0) {
      fetchComments();
    }
  }, [childIds]);

  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't handle keys if modal is open
      if (previewComment) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, comments.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === ' ' && comments[selectedIndex]) {
        e.preventDefault();
        setPreviewComment(comments[selectedIndex]);
      } else if (e.key === 'Enter' && comments[selectedIndex]) {
        e.preventDefault();
        router.push(`/item/${comments[selectedIndex].id}`);
      }
      // Note: ESC is handled by ItemPageClient component
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comments.length, selectedIndex, router, comments, previewComment]);

  // Auto-scroll selected card into view
  useEffect(() => {
    // Only scroll if we have comments and the index is valid
    if (scrollContainerRef.current && comments[selectedIndex]) {
      // Use requestAnimationFrame to let browser restore scroll position first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current || !comments[selectedIndex]) return;

          const container = scrollContainerRef.current;
          const cards = container.querySelectorAll('[role="button"]');
          const selectedCard = cards[selectedIndex] as HTMLElement;

          if (selectedCard) {
            // Check if card is already in view
            const containerRect = container.getBoundingClientRect();
            const cardRect = selectedCard.getBoundingClientRect();

            const isInView = (
              cardRect.left >= containerRect.left &&
              cardRect.right <= containerRect.right
            );

            // Only scroll if not already in view
            if (!isInView) {
              // Calculate position to center the card without scrolling the page
              const scrollLeft = container.scrollLeft +
                (cardRect.left - containerRect.left) -
                (container.clientWidth / 2) +
                (cardRect.width / 2);

              container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
              });
            }
          }
        });
      });
    }
  }, [selectedIndex, comments]);

  const handlePrevious = () => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => Math.min(prev + 1, comments.length - 1));
  };

  if (loading) {
    return (
      <div className="flex gap-4 px-6 py-8 overflow-x-auto">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-96 h-64 bg-bg-secondary border border-border-medium animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-text-muted font-mono">No replies yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons - Desktop Only */}
      {comments.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            disabled={selectedIndex === 0}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-bg-tertiary border-2 border-border-medium hover:border-accent-amber disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous reply"
          >
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            disabled={selectedIndex === comments.length - 1}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-bg-tertiary border-2 border-border-medium hover:border-accent-amber disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next reply"
          >
            <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="px-6 py-8 overflow-x-auto scroll-smooth"
        onWheel={(e) => {
          // Enable horizontal scrolling with mouse wheel
          if (scrollContainerRef.current) {
            e.preventDefault();
            scrollContainerRef.current.scrollLeft += e.deltaY;
          }
        }}
      >
        <div className="flex gap-4">
          {comments.map((comment, index) => (
            <ReplyCard
              key={comment.id}
              id={comment.id}
              author={comment.author}
              text={comment.text}
              timestamp={comment.timestamp}
              replyCount={comment.childIds.length}
              totalReplyCount={comment.totalReplyCount}
              isSelected={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
              onPreview={() => setPreviewComment(comment)}
            />
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewComment && (
        <CommentPreviewModal
          comment={previewComment}
          onClose={() => setPreviewComment(null)}
          onNavigate={() => router.push(`/item/${previewComment.id}`)}
        />
      )}
    </div>
  );
}

export function Carousel({ childIds, parentId }: CarouselProps) {
  if (childIds.length === 0) {
    return (
      <div className="border-t border-border-medium bg-bg-secondary px-6 py-12 text-center">
        <p className="text-text-muted font-mono">No replies yet</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border-medium bg-bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="px-6 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-mono text-text-secondary">
            REPLIES ({childIds.length})
          </h2>
        </div>
        <Suspense fallback={
          <div className="flex gap-4 px-6 py-8 overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-96 h-64 bg-bg-tertiary border border-border-medium animate-pulse"
              />
            ))}
          </div>
        }>
          <CarouselContent childIds={childIds} parentId={parentId} key={parentId} />
        </Suspense>
      </div>
    </div>
  );
}

