import { Link } from '@tanstack/react-router'
import { CircleUser, LayoutDashboard, ListTodo, LogIn } from 'lucide-react'
import { useSession } from '@/entities/session'

// 현재 페이지는 accent-soft 배경 pill, 나머지는 hover 시 canvas 배경.
// 좁은 화면에서는 좌우 여백만 줄이고 라벨과 아이콘은 그대로 둔다.
// 인증 링크(회원정보/로그인)도 같은 크기를 써서 위계 차이로 인한 어색함을 없앤다
const linkClassName =
  'flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-base font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink sm:px-3.5 aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent'

export function Gnb() {
  // 로그인과 로그아웃 즉시 아이콘이 바뀌도록 세션을 구독한다
  const isAuthenticated = useSession()

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <nav
        aria-label="주 메뉴"
        className="mx-auto flex h-16 w-full max-w-3xl items-center gap-0 px-4 sm:gap-1"
      >
        {/* 메뉴는 shrink-0이라 자리가 모자라면 로고만 줄어든다. 어떤 폭에서도 넘치지 않는다 */}
        <Link
          to="/"
          className="mr-2 min-w-0 truncate text-lg font-bold tracking-tight text-ink sm:mr-5"
        >
          TASK CONSOLE
        </Link>
        <Link to="/" className={linkClassName}>
          <LayoutDashboard size={18} aria-hidden />
          대시보드
        </Link>
        <Link to="/task" className={linkClassName}>
          <ListTodo size={18} aria-hidden />할 일
        </Link>
        <div className="ml-auto shrink-0">
          {/* 아주 좁은 화면에서만 아이콘만 남기고 이름은 aria-label로 유지한다.
              메뉴 두 개(대시보드, 할 일)가 요구사항에 명시된 아이콘이라 먼저 지키고,
              라벨은 폭이 정말 부족할 때만 접는다 */}
          {isAuthenticated ? (
            <Link to="/user" className={linkClassName} aria-label="회원정보">
              <CircleUser size={18} aria-hidden />
              <span className="hidden min-[480px]:inline">회원정보</span>
            </Link>
          ) : (
            <Link to="/sign-in" className={linkClassName} aria-label="로그인">
              <LogIn size={18} aria-hidden />
              <span className="hidden min-[480px]:inline">로그인</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
