import { ViewMode, DEFAULT_VIEW_MODE, isViewMode } from '@/domain/types/ViewMode';

/**
 * Local storage key for view mode preference
 */
const VIEW_MODE_KEY = 'neural-stream-view-mode-v2';

/**
 * Get the stored view mode preference
 * Returns the default view mode if no preference is stored or if localStorage is unavailable
 */
export function getViewMode(): ViewMode {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return DEFAULT_VIEW_MODE;
  }

  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);

    // Validate the stored value
    if (stored && isViewMode(stored)) {
      return stored;
    }

    return DEFAULT_VIEW_MODE;
  } catch (error) {
    // localStorage might be unavailable (private browsing, etc.)
    console.warn('Failed to read view mode from localStorage:', error);
    return DEFAULT_VIEW_MODE;
  }
}

/**
 * Store the view mode preference
 */
export function setViewMode(mode: ViewMode): void {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(VIEW_MODE_KEY, mode);
  } catch (error) {
    // localStorage might be unavailable (private browsing, etc.)
    console.warn('Failed to save view mode to localStorage:', error);
  }
}
