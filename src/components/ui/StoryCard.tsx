import Link from 'next/link';
import { Story } from '@/domain/entities/Story';
import { HNApiMapper } from '@/infrastructure/mappers/HNApiMapper';

interface StoryCardProps {
  story: Story;
  index: number;
  variant?: 'grid' | 'list';
  isSelected?: boolean;
  onClick?: () => void;
}

export function StoryCard({ story, index, variant = 'grid', isSelected = false, onClick }: StoryCardProps) {
  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : null;
  const timeAgo = HNApiMapper.formatTimestamp(story.timestamp);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  // List variant - horizontal layout
  if (variant === 'list') {
    return (
      <Link
        href={`/item/${story.id}`}
        className="group block"
        onClick={handleClick}
      >
        <article className="bg-bg-secondary border border-border-subtle hover:border-accent-amber transition-all duration-300 p-3 sm:p-4 flex flex-col gap-2 hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]">
          {/* Title and Domain */}
          <div>
            <h2 className="text-base font-bold text-text-primary group-hover:text-accent-amber transition-colors leading-snug mb-1">
              {story.title}
            </h2>

            {domain && (
              <p className="text-xs text-text-muted font-mono">
                {domain}
              </p>
            )}
          </div>

          {/* Text preview for Ask HN/Show HN */}
          {story.text && (
            <div
              className="text-xs text-text-secondary line-clamp-2 font-crimson my-1"
              dangerouslySetInnerHTML={{ __html: story.text }}
            />
          )}

          {/* Metadata Row */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted font-mono pt-1">
            <span className="flex items-center gap-1 text-text-secondary">
              <span className="text-accent-amber">▲</span>
              {story.points}
            </span>
            <span>by {story.author}</span>
            <span>{timeAgo}</span>
            <span className="text-text-secondary group-hover:text-accent-amber/80 transition-colors">
              {story.commentCount} comments
            </span>
          </div>
        </article>
      </Link>
    );
  }

  // Grid variant - vertical layout (original)
  return (
    <Link
      href={`/item/${story.id}`}
      className="group block h-full"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleClick}
    >
      <article className="animate-slide-up opacity-0 bg-bg-secondary border border-border-subtle hover:border-accent-amber transition-all duration-300 p-5 min-h-[180px] h-full flex flex-col gap-2 hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]">
        {/* Title */}
        <h2 className="text-base font-bold text-text-primary group-hover:text-accent-amber transition-colors leading-tight">
          {story.title}
        </h2>

        {/* Domain */}
        {domain && (
          <p className="text-xs text-text-muted font-mono">
            {domain}
          </p>
        )}

        {/* Text preview for Ask HN/Show HN */}
        {story.text && (
          <div
            className="text-xs text-text-secondary line-clamp-2 font-crimson"
            dangerouslySetInnerHTML={{ __html: story.text }}
          />
        )}

        {/* Metadata */}
        <div className="mt-auto pt-2 grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-text-muted font-mono bg-bg-secondary">
          <span className="flex items-center gap-1">
            <span className="text-accent-amber">▲</span>
            {story.points}
          </span>
          <span className="text-right">{timeAgo}</span>
          <span className="truncate">by {story.author}</span>
          <span className="text-right">{story.commentCount} c</span>
        </div>
      </article>
    </Link>
  );
}
