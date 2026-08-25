import { Circle, CircleAlert, CircleCheck, ClipboardList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDashboardQuery } from '@/entities/dashboard'
import { Button, StatusPanel } from '@/shared/ui'

interface MetricCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
  iconBgClassName: string
}

function MetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  iconBgClassName,
}: MetricCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
      <dt className="flex items-center gap-2 text-sm text-ink-soft">
        {/* 그림자를 못 쓰는 대신 soft 배경 원으로 아이콘에 무게를 준다 */}
        <span
          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${iconBgClassName}`}
        >
          <Icon size={16} className={iconClassName} aria-hidden />
        </span>
        {label}
      </dt>
      <dd className="text-3xl font-bold text-ink">{value}</dd>
    </div>
  )
}

export function DashboardStats() {
  const { data, isPending, isError, refetch } = useDashboardQuery()

  if (isPending) {
    return (
      // 스켈레톤은 카드와 같은 뼈대(패딩, 간격, 줄 높이)를 쓴다. 높이를 숫자로 박으면
      // 카드를 손볼 때마다 어긋나서 로딩이 끝나는 순간 화면이 튄다
      <div role="status" aria-label="대시보드 불러오는 중" className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6"
          >
            <div className="flex items-center gap-2">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-line" />
              <div className="h-4 w-12 animate-pulse rounded bg-line" />
            </div>
            <div className="h-9 w-16 animate-pulse rounded bg-line" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <StatusPanel
        role="alert"
        icon={CircleAlert}
        tone="danger"
        title="대시보드를 불러오지 못했습니다"
        action={
          <Button variant="ghost" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="일"
        value={data.numOfTask}
        icon={ClipboardList}
        iconClassName="text-accent"
        iconBgClassName="bg-accent-soft"
      />
      <MetricCard
        label="해야할 일"
        value={data.numOfRestTask}
        icon={Circle}
        iconClassName="text-ink-soft"
        iconBgClassName="bg-canvas"
      />
      <MetricCard
        label="한 일"
        value={data.numOfDoneTask}
        icon={CircleCheck}
        iconClassName="text-good"
        iconBgClassName="bg-good-soft"
      />
    </dl>
  )
}
