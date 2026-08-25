import { Circle, CircleCheck } from 'lucide-react'
import type { TaskItem } from '../api/get-tasks'

// 가상 스크롤이 높이 고정을 전제하므로 카드(행) 높이는 이 상수로 통일한다.
// 행 104px = 카드 96px + 아래 간격 8px. 메모는 최대 2줄에서 잘린다
export const TASK_ROW_HEIGHT = 104

interface TaskCardProps {
  task: TaskItem
}

const statusBadge = {
  // 미완료는 경고가 아니라 중립 그레이. 색은 완료(초록)만 가져가 시선을 완료에 준다
  TODO: {
    icon: Circle,
    label: 'TODO',
    className: 'bg-canvas text-ink-soft',
  },
  DONE: {
    icon: CircleCheck,
    label: 'DONE',
    className: 'bg-good-soft text-good',
  },
} as const

export function TaskCard({ task }: TaskCardProps) {
  const badge = statusBadge[task.status]
  const BadgeIcon = badge.icon

  return (
    // 클릭 가능하다는 신호를 테두리와 배경을 함께 한 단계 내려서 준다. surface가 팔레트에서
    // 가장 밝아 배경만으로는 변화가 거의 안 보이고, 테두리만으로도 약해 둘을 같이 움직인다.
    // accent를 쓰지 않는 이유는 그 색이 이미 현재 페이지와 포커스를 뜻하기 때문이다.
    // 테두리 두께는 그대로 둬야 hover마다 카드가 밀리지 않는다
    <div className="flex h-24 items-center gap-4 rounded-card border border-line bg-surface px-5 transition-colors duration-200 hover:border-line-strong hover:bg-surface-2">
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${badge.className}`}
      >
        <BadgeIcon size={12} aria-hidden />
        {badge.label}
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-base font-medium text-ink">{task.title}</span>
        <span className="line-clamp-2 text-sm text-ink-soft">{task.memo}</span>
      </span>
    </div>
  )
}
