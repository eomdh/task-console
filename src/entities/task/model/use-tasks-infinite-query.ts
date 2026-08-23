import { useInfiniteQuery } from '@tanstack/react-query'
import { getTasks } from '../api/get-tasks'

export function useTasksInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ['tasks'],
    queryFn: ({ pageParam }) => getTasks(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNext ? allPages.length + 1 : undefined,
  })
}
