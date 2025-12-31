export interface Comment {
  id: string;
  author: string;
  text: string; // Sanitized HTML
  timestamp: number;
  childIds: string[];
  parentId: string;
  isDeleted: boolean;
}
