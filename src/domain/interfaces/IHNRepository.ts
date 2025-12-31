import { StreamNode } from '../entities/StreamNode';
import { Story } from '../entities/Story';

export interface IHNRepository {
  getStreamNode(id: string): Promise<StreamNode>;
  getAncestry(node: StreamNode): Promise<StreamNode[]>;
  getTopStories(limit?: number, offset?: number): Promise<Story[]>;
}
