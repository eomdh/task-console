import { useNavigate } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { useTaskDetailQuery } from '@/entities/task'
import { ApiError } from '@/shared/lib/http'
import { Button } from '@/shared/ui'

// Intl 인스턴스는 생성 비용이 있어 모듈 스코프에서 한 번만 만든다
const dateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

interface TaskDetailProps {
  taskId: string
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const { data, isPending, isError, error, refetch } = useTaskDetailQuery(taskId)
  const navigate = useNavigate()

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="할 일 상세 불러오는 중"
        className="h-44 animate-pulse rounded-card bg-line"
      />
    )
  }

  if (isError) {
    // 없는 리소스는 다시 시도해도 결과가 같으므로 목록 복귀만 제공한다
    if (error instanceof ApiError && error.status === 404) {
      return (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6"
        >
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <CircleAlert size={18} className="text-danger" aria-hidden />
            요청한 할 일이 없습니다
          </p>
          <Button variant="ghost" onClick={() => void navigate({ to: '/task' })}>
            목록으로 돌아가기
          </Button>
        </div>
      )
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-card border border-line bg-surface p-6"
      >
        <p className="flex items-center gap-2 text-sm text-ink-soft">
          <CircleAlert size={18} className="text-danger" aria-hidden />
          할 일을 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-ink">{data.title}</h2>
        <p className="text-xs text-ink-faint">
          등록{' '}
          <time dateTime={data.registerDatetime}>
            {dateTimeFormat.format(new Date(data.registerDatetime))}
          </time>
        </p>
      </header>
      {/* 목록 카드는 두 줄에서 잘리므로 상세에서는 줄바꿈을 살려 전문을 보여준다 */}
      <p className="whitespace-pre-line text-sm text-ink-soft">{data.memo}</p>
    </article>
  )
}
