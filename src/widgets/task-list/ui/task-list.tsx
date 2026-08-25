import { Link, useElementScrollRestoration } from '@tanstack/react-router'
import { CircleAlert, Inbox } from 'lucide-react'
import { useMemo } from 'react'
import type { UIEventHandler } from 'react'
import { TASK_ROW_HEIGHT, TaskCard, useTasksInfiniteQuery } from '@/entities/task'
import { useVirtualWindow } from '@/shared/lib/virtual'
import { Button, StatusPanel } from '@/shared/ui'

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
      // 스켈레톤은 카드와 같은 뼈대를 써서 다른 화면과 로딩 표현을 통일한다
      <div role="status" aria-label="할 일 목록 불러오는 중" className="flex flex-col gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="flex h-24 items-center gap-4 rounded-card border border-line bg-surface px-5"
          >
            <div className="h-6 w-14 shrink-0 animate-pulse rounded-lg bg-line" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="h-6 w-40 animate-pulse rounded bg-line" />
              <div className="h-5 w-64 animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <StatusPanel
        role="alert"
        icon={CircleAlert}
        tone="danger"
        title="할 일 목록을 불러오지 못했습니다"
        action={
          <Button variant="ghost" onClick={() => void refetch()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  if (tasks.length === 0) {
    return (
      <StatusPanel icon={Inbox} title="표시할 할 일이 없습니다" />
    )
  }

  return (
    // scrollbar-gutter로 스크롤바 자리를 항상 예약한다. OS 설정(항상 표시 / 스크롤할 때만)에
    // 따라 스크롤바가 폭을 먹기도 하고 안 먹기도 해서, 예약하지 않으면 카드 우측 끝이
    // 다른 화면과 어긋난다.
    // tabIndex로 키보드 스크롤이 가능한 영역으로 만든다 (윈도우 밖 카드는 Tab 도달 불가)
    <div
      {...containerProps}
      onScroll={handleScroll}
      tabIndex={0}
      // tabIndex만 붙은 div는 role이 generic이고 ARIA가 generic에 이름 붙이는 것을 막는다.
      // region은 이름을 요구하는 role이라 aria-label이 실제로 읽힌다
      role="region"
      aria-label="할 일 목록 스크롤 영역"
      data-scroll-restoration-id={SCROLL_RESTORATION_ID}
      data-testid="task-scroll"
      className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]"
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
      {/* 라이브 리전은 미리 존재해야 읽힌다. 높이도 고정해 scrollHeight 흔들림을 막는다.
          이 줄만 canvas 배경 위라 ink-faint면 4.38:1로 기준에 못 미친다 (ink-soft는 6.88:1) */}
      <p
        role="status"
        className="flex h-10 items-center justify-center text-sm text-ink-soft"
      >
        {isFetchingNextPage ? '더 불러오는 중' : ''}
      </p>
    </div>
  )
}
