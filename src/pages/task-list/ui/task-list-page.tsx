import { DeletedNotice } from '@/features/delete-task'
import { TaskList } from '@/widgets/task-list'

export function TaskListPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-xl font-semibold">할 일</h1>
      <DeletedNotice />
      <TaskList />
    </section>
  )
}
