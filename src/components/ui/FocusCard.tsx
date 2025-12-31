'use client';

import { StreamNode, isStory, isComment } from '@/domain/entities/StreamNode';
import { HNApiMapper } from '@/infrastructure/mappers/HNApiMapper';
import { useExternalLinks } from '@/lib/useExternalLinks';

interface FocusCardProps {
  node: StreamNode;
}

export function FocusCard({ node }: FocusCardProps) {
  const contentRef = useExternalLinks();
  const timeAgo = HNApiMapper.formatTimestamp(node.timestamp);

  if (isStory(node)) {
    const domain = node.url ? new URL(node.url).hostname.replace('www.', '') : null;

    return (
      <article className="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
        <div className="bg-bg-secondary border-l-4 border-accent-amber p-8 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
          {/* Story Title */}
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            {node.title}
          </h1>

          {/* URL */}
          {node.url && (
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-amber hover:text-accent-amber-bright mb-6 font-mono text-sm"
            >
              <span>↗</span>
              <span>{domain}</span>
            </a>
          )}

          {/* Story Text (for Ask HN, Show HN) */}
          {node.text && (
            <div
              ref={contentRef}
              className="prose prose-invert max-w-none mb-6 font-crimson text-lg leading-relaxed"
              dangerouslySetInnerHTML={{ __html: node.text }}
            />
          )}

          {/* Metadata */}
          <div className="flex items-center gap-6 text-text-secondary font-mono text-sm border-t border-border-subtle pt-4 mt-6">
            <span className="flex items-center gap-2">
              <span className="text-accent-amber">▲</span>
              <span className="font-bold">{node.points}</span>
              <span>points</span>
            </span>
            <span>by {node.author}</span>
            <span>{timeAgo}</span>
            <span>{node.commentCount} comments</span>
          </div>
        </div>
      </article>
    );
  }

  if (isComment(node)) {
    return (
      <article className="max-w-4xl mx-auto px-6 py-12 animate-slide-up">
        <div className="bg-bg-secondary border-l-4 border-accent-amber p-8 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
          {/* Comment Author & Time */}
          <div className="flex items-center gap-4 mb-6 text-sm font-mono">
            <span className="text-accent-amber font-bold">{node.author}</span>
            <span className="text-text-muted">{timeAgo}</span>
          </div>

          {/* Comment Text */}
          <div
            ref={contentRef}
            className="prose prose-invert max-w-none font-crimson text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: node.text }}
          />

          {/* Reply Count */}
          {node.childIds.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border-subtle text-text-secondary font-mono text-sm">
              {node.childIds.length} {node.childIds.length === 1 ? 'reply' : 'replies'}
            </div>
          )}
        </div>
      </article>
    );
  }

  return null;
}
