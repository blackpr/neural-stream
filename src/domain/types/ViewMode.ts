/**
 * View mode for displaying stories on the homepage
 */
export type ViewMode = 'grid' | 'list';

/**
 * Default view mode for the homepage
 */
export const DEFAULT_VIEW_MODE: ViewMode = 'grid';

/**
 * Type guard to check if a value is a valid ViewMode
 */
export function isViewMode(value: unknown): value is ViewMode {
  return value === 'grid' || value === 'list';
}
