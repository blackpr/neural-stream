import Link from 'next/link';
import { Story } from '@/domain/entities/Story';
import { HNApiMapper } from '@/infrastructure/mappers/HNApiMapper';

interface StoryCardProps {
  story: Story;
  index: number;
}

export function StoryCard({ story, index }: StoryCardProps) {
  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : null;
  const timeAgo = HNApiMapper.formatTimestamp(story.timestamp);

  return (
    <Link
      href={`/item/${story.id}`}
      className="group block"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="animate-slide-up opacity-0 bg-bg-secondary border border-border-subtle hover:border-accent-amber transition-all duration-300 p-6 h-full flex flex-col gap-3 hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]">
        {/* Title */}
        <h2 className="text-lg font-bold text-text-primary group-hover:text-accent-amber transition-colors leading-tight">
          {story.title}
        </h2>

        {/* Domain */}
        {domain && (
          <p className="text-sm text-text-muted font-mono">
            {domain}
          </p>
        )}

        {/* Text preview for Ask HN/Show HN */}
        {story.text && (
          <div
            className="text-sm text-text-secondary line-clamp-2 font-crimson"
            dangerouslySetInnerHTML={{ __html: story.text }}
          />
        )}

        {/* Metadata */}
        <div className="mt-auto flex items-center gap-4 text-sm text-text-muted font-mono">
          <span className="flex items-center gap-1">
            <span className="text-accent-amber">▲</span>
            {story.points}
          </span>
          <span>by {story.author}</span>
          <span>{timeAgo}</span>
          <span>{story.commentCount} comments</span>
        </div>
      </article>
    </Link>
  );
}
