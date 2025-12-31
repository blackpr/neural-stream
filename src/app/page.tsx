import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import { StoryCard } from '@/components/ui/StoryCard';

export default async function Home() {
  const stories = await hnRepository.getTopStories(30);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-medium bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 bg-accent-amber animate-pulse-glow" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                THE NEURAL STREAM
              </h1>
              <p className="text-text-secondary text-sm mt-1 font-mono">
                HACKER NEWS // REIMAGINED
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Story Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-text-muted text-sm font-mono">
          <p>POWERED BY HACKER NEWS API</p>
        </div>
      </footer>
    </div>
  );
}
