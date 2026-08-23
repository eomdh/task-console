import { Link } from '@tanstack/react-router'
import { CircleAlert, Inbox } from 'lucide-react'
import type { UIEventHandler } from 'react'
import { TASK_ROW_HEIGHT, TaskCard, useTasksInfiniteQuery } from '@/entities/task'
import { Button } from '@/shared/ui'

// 끝에서 카드 3장 이내로 접근하면 다음 페이지를 미리 부른다
const NEXT_PAGE_THRESHOLD_PX = TASK_ROW_HEIGHT * 3

export function TaskList() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksInfiniteQuery()

  const handleScroll: UIEventHandler<HTMLElement> = (event) => {
    const element = event.currentTarget
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight
    if (remaining < NEXT_PAGE_THRESHOLD_PX && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

  if (isPending) {
    return (
      <div role="status" aria-label="할 일 목록 불러오는 중" className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-20 animate-pulse rounded-card bg-line" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6"
      >
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <CircleAlert size={18} className="text-danger" aria-hidden />
          할 일 목록을 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  const tasks = data.pages.flatMap((page) => page.data)

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-10">
        <Inbox size={24} className="text-ink-faint" aria-hidden />
        <p className="text-sm text-ink-soft">표시할 할 일이 없습니다</p>
      </div>
    )
  }

  return (
    // pr-3은 오버레이 스크롤바가 카드 위에 뜨지 않게 하는 여백
    <div
      onScroll={handleScroll}
      data-testid="task-scroll"
      className="min-h-0 flex-1 overflow-y-auto pr-3"
    >
      <ul className="flex flex-col gap-2 pb-4">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              to="/task/$taskId"
              params={{ taskId: task.id }}
              className="block rounded-card"
            >
              <TaskCard task={task} />
            </Link>
          </li>
        ))}
      </ul>
      {isFetchingNextPage ? (
        <p role="status" className="pb-4 text-center text-sm text-ink-faint">
          더 불러오는 중
        </p>
      ) : null}
    </div>
  )
}
