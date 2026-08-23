import { Outlet } from '@tanstack/react-router'
import { Gnb } from '@/widgets/gnb'

export function RootLayout() {
  return (
    // 높이를 뷰포트로 고정해 스크롤이 body가 아니라 페이지 내부에서 일어나게 한다.
    // 목록의 무한 스크롤 트리거가 내부 컨테이너의 onScroll에 걸려 있기 때문
    <div className="flex h-dvh flex-col">
      <Gnb />
      {/* flex 컬럼이라 로그인처럼 세로 중앙 배치가 필요한 페이지는 m-auto로 해결한다 */}
      <main className="mx-auto flex w-full min-h-0 max-w-3xl flex-1 flex-col overflow-y-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
