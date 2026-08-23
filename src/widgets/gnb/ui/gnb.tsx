import { Link } from '@tanstack/react-router'
import { CircleUser, LayoutDashboard, ListTodo, LogIn } from 'lucide-react'
import { tokenStore } from '@/shared/lib/http'

const linkClassName =
  'flex items-center gap-1.5 text-ink aria-[current=page]:text-primary'

export function Gnb() {
  // 라우트 전환마다 렌더되므로 토큰 존재 여부를 그때그때 읽는다.
  // 리액티브한 세션 상태는 로그인 슬라이스에서 도입한다
  const isAuthenticated = Boolean(tokenStore.getAccessToken())

  return (
    <header className="border-b border-border bg-surface">
      <nav
        aria-label="주 메뉴"
        className="mx-auto flex w-full max-w-3xl items-center gap-6 px-4 py-3"
      >
        <Link to="/" className={linkClassName}>
          <LayoutDashboard size={18} aria-hidden />
          대시보드
        </Link>
        <Link to="/task" className={linkClassName}>
          <ListTodo size={18} aria-hidden />할 일
        </Link>
        <div className="ml-auto">
          {isAuthenticated ? (
            <Link to="/user" className={linkClassName}>
              <CircleUser size={18} aria-hidden />
              회원정보
            </Link>
          ) : (
            <Link to="/sign-in" className={linkClassName}>
              <LogIn size={18} aria-hidden />
              로그인
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
