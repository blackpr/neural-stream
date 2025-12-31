'use client';

import { ViewMode } from '@/domain/types/ViewMode';

interface ViewToggleProps {
  currentMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export function ViewToggle({ currentMode, onToggle }: ViewToggleProps) {
  const handleToggle = () => {
    onToggle(currentMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative flex items-center gap-3 px-4 py-2 bg-bg-secondary border border-border-medium hover:border-accent-amber transition-all duration-300 font-mono text-sm"
      aria-label={`Switch to ${currentMode === 'grid' ? 'list' : 'grid'} view`}
    >
      {/* View mode indicator */}
      <span className="text-text-secondary group-hover:text-accent-amber transition-colors">
        VIEW:
      </span>

      {/* Icons container */}
      <div className="flex items-center gap-2">
        {/* Grid icon */}
        <div
          className={`transition-all duration-300 ${currentMode === 'grid'
              ? 'text-accent-amber scale-110'
              : 'text-text-muted scale-90 opacity-50'
            }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="1" y="1" width="6" height="6" />
            <rect x="11" y="1" width="6" height="6" />
            <rect x="1" y="11" width="6" height="6" />
            <rect x="11" y="11" width="6" height="6" />
          </svg>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-border-medium" />

        {/* List icon */}
        <div
          className={`transition-all duration-300 ${currentMode === 'list'
              ? 'text-accent-amber scale-110'
              : 'text-text-muted scale-90 opacity-50'
            }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="1" y1="3" x2="17" y2="3" />
            <line x1="1" y1="9" x2="17" y2="9" />
            <line x1="1" y1="15" x2="17" y2="15" />
          </svg>
        </div>
      </div>

      {/* Active mode label */}
      <span className="text-accent-amber font-bold uppercase tracking-wider">
        {currentMode}
      </span>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-accent-amber/5" />
      </div>
    </button>
  );
}
