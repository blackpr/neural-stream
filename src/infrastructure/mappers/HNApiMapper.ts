import { Story } from '@/domain/entities/Story';
import { Comment } from '@/domain/entities/Comment';
import { StreamNode } from '@/domain/entities/StreamNode';

interface HNItem {
  id: number;
  type: 'story' | 'comment' | 'poll' | 'pollopt' | 'job';
  by?: string;
  time: number;
  text?: string;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  kids?: number[];
  parent?: number;
  deleted?: boolean;
  dead?: boolean;
}

export class HNApiMapper {
  /**
   * Anti-Corruption Layer: Transform HN API data to domain entities
   */
  static toStreamNode(item: HNItem): StreamNode {
    if (item.type === 'story' || item.type === 'job' || item.type === 'poll') {
      return this.toStory(item);
    }
    return this.toComment(item);
  }

  static toStory(item: HNItem): Story {
    return {
      id: String(item.id),
      title: item.title || 'Untitled',
      url: item.url,
      author: item.by || 'unknown',
      points: item.score || 0,
      commentCount: item.descendants || 0,
      timestamp: item.time,
      text: item.text ? this.sanitizeHtml(item.text) : undefined,
      childIds: (item.kids || []).map(String),
    };
  }

  static toComment(item: HNItem): Comment {
    return {
      id: String(item.id),
      author: item.by || 'unknown',
      text: this.sanitizeHtml(item.text || ''),
      timestamp: item.time,
      childIds: (item.kids || []).map(String),
      parentId: String(item.parent || ''),
      isDeleted: item.deleted || item.dead || false,
      totalReplyCount: undefined,
    };
  }

  /**
   * Sanitize HTML and strip common signature patterns
   */
  private static sanitizeHtml(html: string): string {
    // Strip common signature patterns
    const signaturePatterns = [
      /--\s*Sent from my (iPhone|iPad|Android)/gi,
      /--\s*Posted via .+/gi,
      /\[dead\]/gi,
    ];

    let cleaned = html;
    signaturePatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned.trim();
  }

  /**
   * Format timestamp to relative time
   */
  static formatTimestamp(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
  }

  /**
   * Map Algolia API data to StreamNode (Story or Comment)
   */
  static fromAlgolia(item: any): StreamNode {
    const countDescendants = (node: any) => {
      let count = 0;
      if (node.children) {
        count += node.children.length;
        for (const child of node.children) {
          count += countDescendants(child);
        }
      }
      return count;
    };

    const totalReplyCount = countDescendants(item);

    // If it's a story (or poll/job), map to Story
    if (item.type === 'story' || item.type === 'job' || item.type === 'poll') {
      return {
        id: String(item.id),
        title: item.title || 'Untitled',
        url: item.url,
        author: item.author || 'unknown',
        points: item.points || 0,
        commentCount: totalReplyCount, // Use our calculated count or specific field if available
        timestamp: item.created_at_i,
        text: item.text ? this.sanitizeHtml(item.text) : undefined,
        childIds: (item.children || []).map((c: any) => String(c.id)),
      };
    }

    // Otherwise map to Comment
    return {
      id: String(item.id),
      author: item.author || 'unknown',
      text: this.sanitizeHtml(item.text || ''),
      timestamp: item.created_at_i,
      childIds: (item.children || []).map((c: any) => String(c.id)),
      parentId: String(item.parent_id || ''),
      isDeleted: false,
      totalReplyCount,
    };
  }
}
