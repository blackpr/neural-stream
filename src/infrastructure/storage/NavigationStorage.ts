export const FOCUS_INDEX_KEY = 'neural-stream-focus-index';

/**
 * Get the stored focus index
 */
export function getStoredFocusIndex(): number {
  if (typeof window === 'undefined') return -1;
  try {
    const stored = sessionStorage.getItem(FOCUS_INDEX_KEY);
    return stored ? parseInt(stored, 10) : -1;
  } catch (e) {
    console.warn('Failed to read focus index from sessionStorage', e);
    return -1;
  }
}

/**
 * Store the focus index
 */
export function setStoredFocusIndex(index: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(FOCUS_INDEX_KEY, String(index));
  } catch (e) {
    console.warn('Failed to save focus index to sessionStorage', e);
  }
}

/**
 * Clear the stored focus index
 */
export function clearStoredFocusIndex(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(FOCUS_INDEX_KEY);
  } catch (e) {
    console.warn('Failed to clear focus index from sessionStorage', e);
  }
}
