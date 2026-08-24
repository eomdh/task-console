import { useParams } from '@tanstack/react-router'
import { TaskDetail } from '@/widgets/task-detail'

export function TaskDetailPage() {
  const { taskId } = useParams({ from: '/task/$taskId' })

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">할 일 상세</h1>
      <TaskDetail taskId={taskId} />
    </section>
  )
}
