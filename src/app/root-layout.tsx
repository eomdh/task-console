import { Outlet } from '@tanstack/react-router'
import { Gnb } from '@/widgets/gnb'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb />
      {/* flex 컬럼이라 로그인처럼 세로 중앙 배치가 필요한 페이지는 m-auto로 해결한다 */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
