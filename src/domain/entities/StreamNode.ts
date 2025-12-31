import { Story } from './Story';
import { Comment } from './Comment';

export type StreamNode = Story | Comment;

export function isStory(node: StreamNode): node is Story {
  return 'title' in node;
}

export function isComment(node: StreamNode): node is Comment {
  return 'parentId' in node;
}
