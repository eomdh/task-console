import { Link, useElementScrollRestoration } from '@tanstack/react-router'
import { CircleAlert, Inbox } from 'lucide-react'
import { useMemo } from 'react'
import type { UIEventHandler } from 'react'
import { TASK_ROW_HEIGHT, TaskCard, useTasksInfiniteQuery } from '@/entities/task'
import { useVirtualWindow } from '@/shared/lib/virtual'
import { Button } from '@/shared/ui'

// 끝에서 카드 3장 이내로 접근하면 다음 페이지를 미리 부른다.
// 트리거가 scroll 이벤트뿐이라 첫 페이지가 뷰포트보다 커야 동작한다
// (페이지 20건 x 104px = 2080px 전제, 목 서버 페이지 크기와 묶인 암묵 의존)
const NEXT_PAGE_THRESHOLD_PX = TASK_ROW_HEIGHT * 3

// 라우터가 이 id로 스크롤 위치를 히스토리 항목마다 캐시한다
const SCROLL_RESTORATION_ID = 'task-list'

export function TaskList() {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasksInfiniteQuery()

  // 리렌더마다 500개 배열을 다시 만들지 않도록 페이지 데이터가 바뀔 때만 평탄화한다
  const tasks = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])

  // 훅 순서 보장을 위해 조기 return보다 먼저 호출한다
  const scrollEntry = useElementScrollRestoration({ id: SCROLL_RESTORATION_ID })
  const { window: renderWindow, containerProps } = useVirtualWindow({
    itemCount: tasks.length,
    itemHeight: TASK_ROW_HEIGHT,
    initialScrollTop: scrollEntry?.scrollY,
  })

  const handleScroll: UIEventHandler<HTMLElement> = (event) => {
    // 가상 윈도우 갱신과 다음 페이지 트리거를 한 스크롤 이벤트에서 처리한다
    containerProps.onScroll(event)
    const element = event.currentTarget
    const remaining = element.scrollHeight - element.scrollTop - element.clientHeight
    if (remaining < NEXT_PAGE_THRESHOLD_PX && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }

  if (isPending) {
    return (
      <div role="status" aria-label="할 일 목록 불러오는 중" className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="h-24 animate-pulse rounded-card bg-line" />
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
          할 일 목록을 불러오지 못했습니다
        </p>
        <Button variant="ghost" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-10">
        <Inbox size={24} className="text-ink-faint" aria-hidden />
        <p className="text-sm text-ink-soft">표시할 할 일이 없습니다</p>
      </div>
    )
  }

  return (
    // pr-3은 오버레이 스크롤바가 카드 위에 뜨지 않게 하는 여백.
    // tabIndex로 키보드 스크롤이 가능한 영역으로 만든다 (윈도우 밖 카드는 Tab 도달 불가)
    <div
      {...containerProps}
      onScroll={handleScroll}
      tabIndex={0}
      aria-label="할 일 목록 스크롤 영역"
      data-scroll-restoration-id={SCROLL_RESTORATION_ID}
      data-testid="task-scroll"
      className="min-h-0 flex-1 overflow-y-auto pr-3"
    >
      {/* 바깥 div가 전체 높이로 스크롤바를 만들고, 안쪽 ul이 translateY로 이동한다.
          스크롤 중 바뀌는 스타일이 transform 하나뿐이라 reflow가 없다 */}
      <div style={{ height: renderWindow.totalHeight }}>
        {/* preflight가 list-style을 지우면 일부 보조기기가 리스트 시맨틱을 제거하므로 role 명시 */}
        <ul role="list" style={{ transform: `translateY(${renderWindow.offsetY}px)` }}>
          {/* DOM에는 윈도우만 있으므로 보조기기에는 전체 크기와 위치를 알려준다.
              다음 페이지가 남아 있으면 총수 미상(-1)이 ARIA 명세의 표기다 */}
          {tasks.slice(renderWindow.startIndex, renderWindow.endIndex).map((task, index) => (
            <li
              key={task.id}
              aria-setsize={hasNextPage ? -1 : tasks.length}
              aria-posinset={renderWindow.startIndex + index + 1}
              className="pb-2"
              style={{ height: TASK_ROW_HEIGHT }}
            >
              <Link
                to="/task/$taskId"
                params={{ taskId: task.id }}
                className="block rounded-card"
              >
                <TaskCard task={task} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {/* 라이브 리전은 미리 존재해야 읽힌다. 높이도 고정해 scrollHeight 흔들림을 막는다 */}
      <p
        role="status"
        className="flex h-10 items-center justify-center text-sm text-ink-faint"
      >
        {isFetchingNextPage ? '더 불러오는 중' : ''}
      </p>
    </div>
  )
}
