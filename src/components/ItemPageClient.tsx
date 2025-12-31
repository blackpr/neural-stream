'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StreamNode } from '@/domain/entities/StreamNode';
import { Stack } from '@/components/ui/Stack';
import { FocusCard } from '@/components/ui/FocusCard';
import { Carousel } from '@/components/ui/Carousel';

interface ItemPageClientProps {
  node: StreamNode;
  ancestry?: StreamNode[];
}

export function ItemPageClient({ node, ancestry = [] }: ItemPageClientProps) {
  const router = useRouter();

  // Escape key handler - go back one level in the hierarchy
  // This works for both story pages and comment pages
  // Note: Carousel component also has an Escape handler with router.back()
  // Both handlers use the same navigation method, so there's no conflict
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        router.back();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const fullPathNodes = [...ancestry, node];
  const path = fullPathNodes.map(n => ({
    id: n.id,
    title: 'title' in n ? n.title : `Comment by ${n.author}`,
  }));

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
      <Carousel childIds={childIds} parentId={node.id} />
    </div>
  );
}
