import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { hnRepository } from '@/infrastructure/repositories/HNFirebaseRepository';
import HomePageClient from '@/components/HomePageClient';

export default async function Home() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['topStories'],
    queryFn: async ({ pageParam = 0 }) => {
      return hnRepository.getTopStories(30, pageParam as number);
    },
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageClient />
    </HydrationBoundary>
  );
}
