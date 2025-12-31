export const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

export const CACHE_CONFIG = {
  topStories: { revalidate: 60 }, // 1 minute
  item: { revalidate: 3600 }, // 1 hour
} as const;

export const TOP_STORIES_LIMIT = 30;
