import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import { ItemPageClient } from '@/components/ItemPageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const node = await hnRepository.getStreamNode(id);

  return <ItemPageClient node={node} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const node = await hnRepository.getStreamNode(id);

  const title = 'title' in node ? node.title : `Comment by ${node.author}`;

  return {
    title: `${title} | The Neural Stream`,
    description: 'Read and explore Hacker News discussions',
  };
}
