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

    // Load stories
    async function loadStories() {
      try {
        const fetchedStories = await hnRepository.getTopStories(30);
        setStories(fetchedStories);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

  const handleViewToggle = (mode: ViewMode) => {
    setViewModeState(mode);
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight">
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
              LOADING STORIES...
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <StoryGrid stories={stories} />
        ) : (
          <StoryList stories={stories} />
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
