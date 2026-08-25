import { useNavigate } from '@tanstack/react-router'
import { CircleAlert, LayoutDashboard } from 'lucide-react'
import { Button, StatusPanel } from '@/shared/ui'

// 라우트 트리에 없는 주소로 들어왔을 때. 라우터 기본 화면은 영어 한 줄이라 대체한다
export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <StatusPanel
        icon={CircleAlert}
        tone="danger"
        title="요청한 페이지가 없습니다"
        description="주소가 잘못되었거나 삭제된 페이지입니다"
        action={
          <Button variant="ghost" onClick={() => void navigate({ to: '/' })}>
            <LayoutDashboard size={16} aria-hidden />
            대시보드로
          </Button>
        }
      />
    </section>
  )
}
