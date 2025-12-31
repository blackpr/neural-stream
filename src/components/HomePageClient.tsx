'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { StoryGrid } from '@/components/ui/StoryGrid';
import { StoryList } from '@/components/ui/StoryList';
import { ViewMode } from '@/domain/types/ViewMode';
import { getViewMode, setViewMode } from '@/infrastructure/storage/ViewPreferenceStorage';
import { getStoredFocusIndex, setStoredFocusIndex, clearStoredFocusIndex, clearAllCommentFocusIndices } from '@/infrastructure/storage/NavigationStorage';

export default function HomePageClient() {
  const [viewMode, setViewModeState] = useState<ViewMode>('list');
  const PAGE_SIZE = 30;

  // React Query Infinite Scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['topStories'],
    queryFn: async ({ pageParam = 0 }) => {
      const stories = await hnRepository.getTopStories(PAGE_SIZE, pageParam);
      return stories;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined;
    },
    // Keep unused data in cache for 10 minutes to support back navigation
    // Stale time controls when we automatically refetch on window focus
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const stories = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  const loading = status === 'pending';
  // We don't need explicit loadingMore state matching manual ref, 
  // isFetchingNextPage covers it.

  // Refs for keyboard navigation management
  const loadMoreBtnRef = useRef<HTMLButtonElement>(null);
  const prevStoryCountRef = useRef(0);
  const shouldFocusNewStoriesRef = useRef(false);

  // Focus persistence
  const [initialFocusIndex, setInitialFocusIndex] = useState(-1);
  const hasRestoredFocusRef = useRef(false);

  // Using explicit handle types
  const storyComponentRef = useRef<{ focusLast: () => void; focusIndex: (index: number) => void }>(null);

  // Focus management after loading new stories
  useEffect(() => {
    // If we have new stories (and not just initial load)
    if (shouldFocusNewStoriesRef.current && stories.length > prevStoryCountRef.current && prevStoryCountRef.current > 0) {
      const indexToFocus = prevStoryCountRef.current;
      // Focus the first new story
      // Small timeout to allow render
      setTimeout(() => {
        storyComponentRef.current?.focusIndex(indexToFocus);
        shouldFocusNewStoriesRef.current = false;
        loadMoreBtnRef.current?.blur();
      }, 50);
    }
    // Initial load restoration - only once
    else if (!hasRestoredFocusRef.current && stories.length > 0 && initialFocusIndex >= 0) {
      if (initialFocusIndex < stories.length) {
        // Use requestAnimationFrame to wait for browser scroll restoration
        // This gives iOS Safari time to restore the scroll position naturally
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            storyComponentRef.current?.focusIndex(initialFocusIndex);
            hasRestoredFocusRef.current = true;
            // Clear storage so we don't restore again on simple refresh
            clearStoredFocusIndex();
          });
        });
      }
    }

    prevStoryCountRef.current = stories.length;
  }, [stories, initialFocusIndex]);

  // Handle focus change - no longer auto-saving
  const handleFocusChange = (index: number) => {
    // We only save explicitly on navigation now via StoryList/StoryGrid
  };

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

  // Load view preference on mount
  useEffect(() => {
    // Load view preference
    const savedMode = getViewMode();
    setViewModeState(savedMode);

    // Load saved focus
    const savedFocus = getStoredFocusIndex();
    setInitialFocusIndex(savedFocus);

    // If no focus is saved (fresh load or refresh), clear any stale comment indices
    if (savedFocus === -1) {
      clearAllCommentFocusIndices();
    }
  }, []);

  const handleViewToggle = (mode: ViewMode) => {
    setViewModeState(mode);
    setViewMode(mode);
  };

  const handleLoadMore = async () => {
    if (isFetchingNextPage) return;
    shouldFocusNewStoriesRef.current = true;
    fetchNextPage();
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
      <header className="border-b border-border-subtle bg-bg-primary transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight text-text-primary">
              THE NEURAL STREAM
            </h1>

            {/* View Toggle and Refresh */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="group flex items-center gap-2 px-3 py-2 text-sm font-mono text-text-secondary hover:text-accent-amber transition-colors"
                title="Force Refresh Stream"
              >
                <span className="sr-only">Refresh Stream</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">SYNC</span>
              </button>
              <ViewToggle currentMode={viewMode} onToggle={handleViewToggle} />
            </div>
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
                initialSelectedIndex={initialFocusIndex}
                onFocusChange={handleFocusChange}
                onNavigate={(index) => setStoredFocusIndex(index)}
              />
            ) : (
              <StoryList
                ref={storyComponentRef}
                stories={stories}
                onNavigatePastEnd={handleNavigatePastEnd}
                initialSelectedIndex={initialFocusIndex}
                onFocusChange={handleFocusChange}
                onNavigate={(index) => setStoredFocusIndex(index)}
              />
            )}

            {/* Load More Button */}
            <div className="flex justify-center pt-8 border-t border-border-subtle/30">
              <button
                ref={loadMoreBtnRef}
                onClick={handleLoadMore}
                onKeyDown={handleButtonKeyDown}
                // Use aria-disabled instead of disabled to maintain focus during loading
                aria-disabled={isFetchingNextPage}
                className={`group relative px-8 py-3 bg-transparent overflow-hidden rounded-none border transition-all focus:outline-none focus:ring-2 focus:ring-accent-amber focus:ring-offset-2 focus:ring-offset-bg-primary
                  ${isFetchingNextPage
                    ? 'border-text-secondary/10 cursor-wait opacity-70'
                    : 'border-text-secondary/30 hover:border-accent-amber focus-visible:bg-accent-amber/10'
                  }`}
              >
                <div className={`absolute inset-0 w-0 bg-accent-amber transition-all duration-[250ms] ease-out opacity-10 ${!isFetchingNextPage && 'group-hover:w-full'}`}></div>
                <div className="relative flex items-center gap-3">
                  {isFetchingNextPage && (
                    <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className={`font-mono text-sm tracking-widest transition-colors ${isFetchingNextPage ? 'text-text-secondary' : 'text-text-primary group-hover:text-accent-amber'}`}>
                    {isFetchingNextPage ? 'DOWNLOADING DATA...' : 'LOAD MORE SIGNALS'}
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
