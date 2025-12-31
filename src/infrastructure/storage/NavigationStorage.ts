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

export function getStoredCommentFocusIndex(parentId: string | number): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = `${FOCUS_INDEX_KEY}-comment-${parentId}`;
    const stored = sessionStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  } catch (e) {
    console.warn('Failed to read comment focus index from sessionStorage', e);
    return 0;
  }
}

export function setStoredCommentFocusIndex(parentId: string | number, index: number): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${FOCUS_INDEX_KEY}-comment-${parentId}`;
    sessionStorage.setItem(key, String(index));
  } catch (e) {
    console.warn('Failed to save comment focus index to sessionStorage', e);
  }
}

/**
 * Clear all comment focus indices (used on home page refresh)
 */
export function clearAllCommentFocusIndices(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`${FOCUS_INDEX_KEY}-comment-`)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear comment focus indices', e);
  }
}
