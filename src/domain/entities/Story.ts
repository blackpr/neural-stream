export interface Story {
  id: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  commentCount: number;
  timestamp: number;
  text?: string; // For Ask HN, Show HN posts
  childIds: string[]; // Comment IDs
}
