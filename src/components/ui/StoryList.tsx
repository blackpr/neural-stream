import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { Story } from '@/domain/entities/Story';
import { StoryCard } from './StoryCard';

interface StoryListProps {
  stories: Story[];
  onNavigatePastEnd?: () => void;
}

export interface StoryListHandle {
  focusLast: () => void;
  focusIndex: (index: number) => void;
}

export const StoryList = forwardRef<StoryListHandle, StoryListProps>(({ stories, onNavigatePastEnd }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focusLast: () => {
      setSelectedIndex(stories.length - 1);
    },
    focusIndex: (index: number) => {
      if (index >= 0 && index < stories.length) {
        setSelectedIndex(index);
      }
    }
  }), [stories]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if event was already handled (e.g. by a button)
      // or if the user is focused on an interactive element
      if (e.defaultPrevented || (document.activeElement && document.activeElement !== document.body)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        if (selectedIndex === stories.length - 1) {
          e.preventDefault();
          setSelectedIndex(-1);
          onNavigatePastEnd?.();
          return;
        }

        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) return 0;
          return Math.min(prev + 1, stories.length - 1);
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) return 0;
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === 'Enter' && selectedIndex >= 0 && stories[selectedIndex]) {
        e.preventDefault();
        router.push(`/item/${stories[selectedIndex].id}`);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, stories, router, onNavigatePastEnd]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const cards = listRef.current.querySelectorAll('article');
      const selectedCard = cards[selectedIndex] as HTMLElement;

      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedIndex]);

  return (
    <div ref={listRef} className="flex flex-col gap-4">
      {stories.map((story, index) => (
        <div
          key={story.id}
          className={`transition-all duration-200 ${selectedIndex === index
            ? 'ring-2 ring-accent-amber ring-offset-2 ring-offset-bg-primary'
            : ''
            }`}
        >
          <StoryCard
            story={story}
            index={index}
            variant="list"
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        </div>
      ))}
    </div>
  );
});
StoryList.displayName = 'StoryList';
