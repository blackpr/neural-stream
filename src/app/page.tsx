'use client';

import { useState, useEffect, useRef } from 'react';
import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { StoryGrid } from '@/components/ui/StoryGrid';
import { StoryList } from '@/components/ui/StoryList';
import { ViewMode } from '@/domain/types/ViewMode';
import { getViewMode, setViewMode } from '@/infrastructure/storage/ViewPreferenceStorage';
import { Story } from '@/domain/entities/Story';

export default function Home() {
  const [viewMode, setViewModeState] = useState<ViewMode>('list');
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 30;

  // Refs for keyboard navigation management
  // Refs for keyboard navigation management
  const loadMoreBtnRef = useRef<HTMLButtonElement>(null);
  const prevStoryCountRef = useRef(0);
  const shouldFocusNewStoriesRef = useRef(false);

  // Using explicit handle types
  const storyComponentRef = useRef<{ focusLast: () => void; focusIndex: (index: number) => void }>(null);

  // Focus management after loading new stories
  useEffect(() => {
    if (shouldFocusNewStoriesRef.current && stories.length > prevStoryCountRef.current) {
      // Focus the first new story
      storyComponentRef.current?.focusIndex(prevStoryCountRef.current);
      shouldFocusNewStoriesRef.current = false;
      // Also blur the button so we don't have dual focus
      loadMoreBtnRef.current?.blur();
    }
    prevStoryCountRef.current = stories.length;
  }, [stories]);

  // Escape key handler - do nothing on homepage
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Do nothing - we're already at the top level
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load view preference and stories on mount
  useEffect(() => {
    // Load view preference
    const savedMode = getViewMode();
    setViewModeState(savedMode);

    // Load initial stories
    async function loadInitialStories() {
      try {
        const fetchedStories = await hnRepository.getTopStories(PAGE_SIZE, 0);
        setStories(fetchedStories);
        setOffset(PAGE_SIZE);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadInitialStories();
  }, []);

  const handleViewToggle = (mode: ViewMode) => {
    setViewModeState(mode);
    setViewMode(mode);
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    shouldFocusNewStoriesRef.current = true;
    try {
      const moreStories = await hnRepository.getTopStories(PAGE_SIZE, offset);
      setStories(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const uniqueMore = moreStories.filter(s => !existingIds.has(s.id));
        return [...prev, ...uniqueMore];
      });
      setOffset(prev => prev + PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more stories:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNavigatePastEnd = () => {
    loadMoreBtnRef.current?.focus();
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    // Navigation keys should be intercepted to prevent them from bubbling
    // to the window listener (which would reset grid selection to 0)
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        // Allow going back to the grid/list with Up or Left
        e.preventDefault();
        e.stopPropagation();
        storyComponentRef.current?.focusLast();
        loadMoreBtnRef.current?.blur();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        // Block these keys to prevent "Jump to Top" behavior in Grid/List
        break;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle sticky top-0 bg-bg-primary/80 backdrop-blur-md z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-text-primary">
              THE NEURAL STREAM
            </h1>

            {/* View Toggle */}
            <ViewToggle currentMode={viewMode} onToggle={handleViewToggle} />
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-text-secondary font-mono animate-pulse">
              INITIALIZING STREAM...
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {viewMode === 'grid' ? (
              <StoryGrid
                ref={storyComponentRef}
                stories={stories}
                onNavigatePastEnd={handleNavigatePastEnd}
              />
            ) : (
              <StoryList
                ref={storyComponentRef}
                stories={stories}
                onNavigatePastEnd={handleNavigatePastEnd}
              />
            )}

            {/* Load More Button */}
            <div className="flex justify-center pt-8 border-t border-border-subtle/30">
              <button
                ref={loadMoreBtnRef}
                onClick={handleLoadMore}
                onKeyDown={handleButtonKeyDown}
                // Use aria-disabled instead of disabled to maintain focus during loading
                aria-disabled={loadingMore}
                className={`group relative px-8 py-3 bg-transparent overflow-hidden rounded-none border transition-all focus:outline-none focus:ring-2 focus:ring-accent-amber focus:ring-offset-2 focus:ring-offset-bg-primary
                  ${loadingMore
                    ? 'border-text-secondary/10 cursor-wait opacity-70'
                    : 'border-text-secondary/30 hover:border-accent-amber focus-visible:bg-accent-amber/10'
                  }`}
              >
                <div className={`absolute inset-0 w-0 bg-accent-amber transition-all duration-[250ms] ease-out opacity-10 ${!loadingMore && 'group-hover:w-full'}`}></div>
                <div className="relative flex items-center gap-3">
                  {loadingMore && (
                    <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className={`font-mono text-sm tracking-widest transition-colors ${loadingMore ? 'text-text-secondary' : 'text-text-primary group-hover:text-accent-amber'}`}>
                    {loadingMore ? 'DOWNLOADING DATA...' : 'LOAD MORE SIGNALS'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-text-muted text-sm font-mono">
          <p>POWERED BY HACKER NEWS API</p>
        </div>
      </footer>
    </div>
  );
}
