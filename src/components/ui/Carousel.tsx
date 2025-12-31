'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Comment } from '@/domain/entities/Comment';
import { ReplyCard } from './ReplyCard';
import { HNApiMapper } from '@/infrastructure/mappers/HNApiMapper';
import { useRouter } from 'next/navigation';

interface CarouselProps {
  childIds: string[];
}

function CarouselContent({ childIds }: CarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      try {
        const fetchedComments = await Promise.all(
          childIds.map(async (id) => {
            const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const data = await response.json();
            return HNApiMapper.toStreamNode(data) as Comment;
          })
        );
        // Filter out deleted comments
        setComments(fetchedComments.filter(c => !c.isDeleted));
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
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, comments.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && comments[selectedIndex]) {
        e.preventDefault();
        router.push(`/item/${comments[selectedIndex].id}`);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        router.back();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comments.length, selectedIndex, router, comments]);

  // Auto-scroll selected card into view
  useEffect(() => {
    if (scrollContainerRef.current && comments[selectedIndex]) {
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll('button');
      const selectedCard = cards[selectedIndex] as HTMLElement;

      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
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
            className="flex-shrink-0 w-80 h-48 bg-bg-secondary border border-border-medium animate-pulse"
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
              isSelected={index === selectedIndex}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Carousel({ childIds }: CarouselProps) {
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
                className="flex-shrink-0 w-80 h-48 bg-bg-tertiary border border-border-medium animate-pulse"
              />
            ))}
          </div>
        }>
          <CarouselContent childIds={childIds} />
        </Suspense>
      </div>
    </div>
  );
}
