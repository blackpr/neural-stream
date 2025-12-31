import { StreamNode } from '../entities/StreamNode';
import { Story } from '../entities/Story';

export interface IHNRepository {
  getStreamNode(id: string): Promise<StreamNode>;
  getTopStories(limit?: number): Promise<Story[]>;
}
