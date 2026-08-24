import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTask } from '../api/delete-task'
import { notifyDeleted } from './deleted-flash'

export function useDeleteTaskMutation(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['task', taskId] })
      // offset 페이지네이션이라 한 건이 지워지면 뒤 항목이 한 칸씩 당겨진다.
      // 캐시에서 항목만 빼면 다음 페이지를 받을 때 경계에서 한 건이 누락되므로
      // 목록을 통째로 무효화한다
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      notifyDeleted()
    },
  })
}
