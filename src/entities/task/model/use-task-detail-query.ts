import { useQuery } from '@tanstack/react-query'
import { getTaskDetail } from '../api/get-task-detail'

export function useTaskDetailQuery(id: string) {
  return useQuery({ queryKey: ['task', id], queryFn: () => getTaskDetail(id) })
}
