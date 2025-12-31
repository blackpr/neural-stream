import { IHNRepository } from '@/domain/interfaces/IHNRepository';
import { StreamNode } from '@/domain/entities/StreamNode';
import { Story } from '@/domain/entities/Story';
import { HNApiMapper } from '../mappers/HNApiMapper';
import { HN_API_BASE, CACHE_CONFIG, TOP_STORIES_LIMIT } from '@/lib/constants';

export class HNFirebaseRepository implements IHNRepository {
  async getStreamNode(id: string): Promise<StreamNode> {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`, {
      next: CACHE_CONFIG.item,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }

    const data = await response.json();

    if (!data) {
      throw new Error(`Item ${id} not found`);
    }

    return HNApiMapper.toStreamNode(data);
  }

  async getAncestry(node: StreamNode): Promise<StreamNode[]> {
    const ancestry: StreamNode[] = [];
    let currentNode = node;

    // Safety break to prevent infinite loops in case of malformed data
    let depth = 0;
    const MAX_DEPTH = 30;

    while ('parentId' in currentNode && currentNode.parentId && depth < MAX_DEPTH) {
      try {
        // Fetch parent
        const parent = await this.getStreamNode(currentNode.parentId);
        ancestry.unshift(parent);
        currentNode = parent;
        depth++;
      } catch (error) {
        console.warn(`Failed to fetch ancestor for node ${currentNode.id}`, error);
        break;
      }
    }

    return ancestry;
  }

  async getTopStories(limit = TOP_STORIES_LIMIT): Promise<Story[]> {
    // Fetch top story IDs
    const response = await fetch(`${HN_API_BASE}/topstories.json`, {
      next: CACHE_CONFIG.topStories,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top stories');
    }

    const storyIds: number[] = await response.json();
    const limitedIds = storyIds.slice(0, limit);

    // Fetch each story in parallel
    const stories = await Promise.all(
      limitedIds.map(async (id) => {
        const itemResponse = await fetch(`${HN_API_BASE}/item/${id}.json`, {
          next: CACHE_CONFIG.item,
        });
        const data = await itemResponse.json();
        return HNApiMapper.toStory(data);
      })
    );

    return stories;
  }
}

// Singleton instance
export const hnRepository = new HNFirebaseRepository();
