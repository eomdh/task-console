import { useNavigate } from '@tanstack/react-router'
import { CircleAlert } from 'lucide-react'
import { useUserQuery } from '@/entities/user'
import { SignOutButton } from '@/features/sign-out'
import { Button } from '@/shared/ui'

export function UserProfile() {
  const { data, isPending, isError, refetch } = useUserQuery()
  const navigate = useNavigate()

  if (isPending) {
    return (
      // 스켈레톤은 카드와 같은 뼈대를 써서 높이가 저절로 맞게 둔다 (로딩 종료 시 화면 튐 방지)
      <div
        role="status"
        aria-label="회원정보 불러오는 중"
        className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6"
      >
        {[0, 1].map((index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="h-4 w-10 animate-pulse rounded bg-line" />
            <div className="h-5 w-40 animate-pulse rounded bg-line" />
          </div>
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
          회원정보를 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6">
        {/* 값끼리는 같은 단계로 둔다. 위계는 위의 캡션 라벨이 이미 만들고 있다 */}
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-ink-faint">이름</dt>
          <dd className="text-sm text-ink">{data.name}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-ink-faint">메모</dt>
          <dd className="whitespace-pre-line text-sm text-ink">{data.memo}</dd>
        </div>
      </dl>
      <div className="flex justify-end">
        <SignOutButton onSignedOut={() => void navigate({ to: '/sign-in' })} />
      </div>
    </div>
  )
}
