import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type StatusTone = 'neutral' | 'danger'

interface StatusPanelProps {
  icon: LucideIcon
  title: string
  description?: string
  tone?: StatusTone
  // 복구 수단. 빈 목록처럼 할 게 없는 상태도 있어 선택이다
  action?: ReactNode
  // 에러는 alert로 즉시 알리고 나머지는 기본값. 쓰는 쪽이 정한다
  role?: 'alert' | 'status'
}

const toneClassName: Record<StatusTone, string> = {
  neutral: 'bg-canvas text-ink-faint',
  danger: 'bg-danger-soft text-danger',
}

// 로딩 이후의 막다른 상태(에러, 빈 목록, 404)를 한 모양으로 그린다.
// 화면마다 같은 마크업을 복붙하면 여백과 정렬이 조금씩 갈라진다
export function StatusPanel({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  action,
  role,
}: StatusPanelProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-4 rounded-card border border-line bg-surface px-6 py-12 text-center"
    >
      <span
        className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full ${toneClassName[tone]}`}
      >
        <Icon size={24} aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-ink">{title}</p>
        {description ? <p className="text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
