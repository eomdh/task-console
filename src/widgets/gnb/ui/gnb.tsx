import { Link } from '@tanstack/react-router'
import { CircleUser, LayoutDashboard, ListTodo, LogIn } from 'lucide-react'
import { tokenStore } from '@/shared/lib/http'

// 현재 페이지는 accent-soft 배경 pill, 나머지는 hover 시 canvas 배경
const linkClassName =
  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-base font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent'

// 우측 인증 링크는 라우트 메뉴보다 한 단계 작게
const authLinkClassName =
  'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink aria-[current=page]:bg-accent-soft aria-[current=page]:text-accent'

export function Gnb() {
  // 라우트 전환마다 렌더되므로 토큰 존재 여부를 그때그때 읽는다.
  // 리액티브한 세션 상태는 로그인 슬라이스에서 도입한다
  const isAuthenticated = Boolean(tokenStore.getAccessToken())

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <nav
        aria-label="주 메뉴"
        className="mx-auto flex h-16 w-full max-w-3xl items-center gap-1 px-4"
      >
        <Link to="/" className="mr-5 flex items-center text-lg font-bold tracking-tight text-ink">
          TASK CONSOLE
        </Link>
        <Link to="/" className={linkClassName}>
          <LayoutDashboard size={18} aria-hidden />
          대시보드
        </Link>
        <Link to="/task" className={linkClassName}>
          <ListTodo size={18} aria-hidden />할 일
        </Link>
        <div className="ml-auto">
          {isAuthenticated ? (
            <Link to="/user" className={authLinkClassName}>
              <CircleUser size={16} aria-hidden />
              회원정보
            </Link>
          ) : (
            <Link to="/sign-in" className={authLinkClassName}>
              <LogIn size={16} aria-hidden />
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
