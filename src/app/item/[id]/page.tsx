import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import { Stack } from '@/components/ui/Stack';
import { FocusCard } from '@/components/ui/FocusCard';
import { Carousel } from '@/components/ui/Carousel';
import { isComment } from '@/domain/entities/StreamNode';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemPage({ params }: PageProps) {
  const { id } = await params;
  const node = await hnRepository.getStreamNode(id);

  // For now, simple path - in a real app, you'd track the full path through context
  const path = [
    {
      id: node.id,
      title: 'title' in node ? node.title : `Comment by ${node.author}`,
    },
  ];

  const childIds = node.childIds;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Stack (Breadcrumbs) */}
      <Stack path={path} />

      {/* Focus Card */}
      <div className="flex-1">
        <FocusCard node={node} />
      </div>

      {/* Carousel (Replies) */}
      <Carousel childIds={childIds} />
    </div>
  );
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
