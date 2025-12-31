export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Stack Skeleton */}
      <div className="border-b border-border-medium bg-bg-secondary px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-5 w-64 bg-bg-tertiary animate-pulse" />
        </div>
      </div>

      {/* Focus Card Skeleton */}
      <div className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="bg-bg-secondary border-l-4 border-border-medium p-8 space-y-6">
          <div className="h-12 w-3/4 bg-bg-tertiary animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-bg-tertiary animate-pulse" />
            <div className="h-4 w-full bg-bg-tertiary animate-pulse" />
            <div className="h-4 w-2/3 bg-bg-tertiary animate-pulse" />
          </div>
          <div className="flex gap-6 pt-4">
            <div className="h-4 w-24 bg-bg-tertiary animate-pulse" />
            <div className="h-4 w-32 bg-bg-tertiary animate-pulse" />
            <div className="h-4 w-20 bg-bg-tertiary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Carousel Skeleton */}
      <div className="border-t border-border-medium bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4 border-b border-border-subtle">
            <div className="h-4 w-32 bg-bg-tertiary animate-pulse" />
          </div>
          <div className="flex gap-4 px-6 py-8 overflow-x-auto">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-80 h-48 bg-bg-tertiary border border-border-medium animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
