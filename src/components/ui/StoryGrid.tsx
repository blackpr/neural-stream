import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { Story } from '@/domain/entities/Story';
import { StoryCard } from './StoryCard';

interface StoryGridProps {
  stories: Story[];
  onNavigatePastEnd?: () => void;
}

export interface StoryGridHandle {
  focusLast: () => void;
  focusIndex: (index: number) => void;
}

export const StoryGrid = forwardRef<StoryGridHandle, StoryGridProps>(({ stories, onNavigatePastEnd }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);

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

  // Calculate grid dimensions for 2D navigation
  const getGridDimensions = () => {
    if (!gridRef.current) return { cols: 3, rows: 0 };

    const width = gridRef.current.offsetWidth;
    let cols = 3; // default lg
    if (width < 768) cols = 1; // mobile
    else if (width < 1024) cols = 2; // tablet

    const rows = Math.ceil(stories.length / cols);
    return { cols, rows };
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if event was already handled (e.g. by a button)
      // or if the user is focused on an interactive element (input, button, link, etc.)
      if (e.defaultPrevented || (document.activeElement && document.activeElement !== document.body)) {
        return;
      }

      const { cols } = getGridDimensions();

      if (e.key === 'ArrowRight') {
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
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) return 0;
          return Math.max(prev - 1, 0);
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();

        // Check if moving down would go past the last item or the last row
        if (selectedIndex !== -1) {
          const next = selectedIndex + cols;
          if (next >= stories.length) {
            setSelectedIndex(-1);
            onNavigatePastEnd?.();
            return;
          }
        }

        setSelectedIndex((prev) => {
          if (prev === -1) return 0;
          const next = prev + cols;
          return Math.min(next, stories.length - 1);
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          if (prev === -1) return 0;
          const next = prev - cols;
          return Math.max(next, 0);
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
    if (selectedIndex >= 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('article');
      const selectedCard = cards[selectedIndex] as HTMLElement;

      if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedIndex]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
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
            variant="grid"
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        </div>
      ))}
    </div>
  );
});
StoryGrid.displayName = 'StoryGrid';
