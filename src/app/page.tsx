'use client';

import { useState, useEffect } from 'react';
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
              <StoryGrid stories={stories} />
            ) : (
              <StoryList stories={stories} />
            )}

            {/* Load More Button */}
            <div className="flex justify-center pt-8 border-t border-border-subtle/30">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-none border border-text-secondary/30 hover:border-accent-amber transition-colors focus:outline-none focus:ring-2 focus:ring-accent-amber/50"
              >
                <div className="absolute inset-0 w-0 bg-accent-amber transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                <div className="relative flex items-center gap-3">
                  {loadingMore && (
                    <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span className="font-mono text-sm tracking-widest text-text-primary group-hover:text-accent-amber transition-colors">
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
