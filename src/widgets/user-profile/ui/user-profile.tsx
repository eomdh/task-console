import { CircleAlert } from 'lucide-react'
import { useUserQuery } from '@/entities/user'
import { Button } from '@/shared/ui'

export function UserProfile() {
  const { data, isPending, isError, refetch } = useUserQuery()

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="회원정보 불러오는 중"
        className="h-36 animate-pulse rounded-card bg-line"
      />
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
          회원정보를 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <dl className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6">
      <div className="flex flex-col gap-1">
        <dt className="text-xs text-ink-faint">이름</dt>
        <dd className="text-base font-semibold text-ink">{data.name}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-xs text-ink-faint">메모</dt>
        <dd className="whitespace-pre-line text-sm text-ink-soft">{data.memo}</dd>
      </div>
    </dl>
  )
}
