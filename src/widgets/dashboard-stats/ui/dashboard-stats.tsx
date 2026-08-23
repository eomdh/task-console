import { Circle, CircleAlert, CircleCheck, ClipboardList } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useDashboardQuery } from '@/entities/dashboard'
import { Button } from '@/shared/ui'

interface MetricCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconClassName: string
}

function MetricCard({ label, value, icon: Icon, iconClassName }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5">
      <dt className="flex items-center gap-2 text-sm text-ink-soft">
        <Icon size={16} className={iconClassName} aria-hidden />
        {label}
      </dt>
      <dd className="text-2xl font-bold text-ink">{value}</dd>
    </div>
  )
}

export function DashboardStats() {
  const { data, isPending, isError, refetch } = useDashboardQuery()

  if (isPending) {
    return (
      <div role="status" aria-label="대시보드 불러오는 중" className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-28 animate-pulse rounded-card bg-line" />
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
          대시보드를 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="일" value={data.numOfTask} icon={ClipboardList} iconClassName="text-accent" />
      <MetricCard label="해야할 일" value={data.numOfRestTask} icon={Circle} iconClassName="text-ink-soft" />
      <MetricCard label="한 일" value={data.numOfDoneTask} icon={CircleCheck} iconClassName="text-good" />
    </dl>
  )
}
