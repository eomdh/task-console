import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createToken } from '@/mocks/token'
import { tokenStore } from '@/shared/lib/http'
import { createAppRouter } from './router'

function renderTaskList() {
  const router = createAppRouter(createMemoryHistory({ initialEntries: ['/task'] }))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

beforeEach(() => {
  tokenStore.save({
    accessToken: createToken('demo-user', 60_000),
    refreshToken: createToken('demo-user', 60_000),
  })
  // jsdom은 레이아웃이 없어 가상 스크롤의 뷰포트 측정을 흉내낸다
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: 600,
  })
})

afterEach(() => {
  tokenStore.clear()
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
})

describe('할 일 목록', () => {
  it('화면에 보일 윈도우만 렌더하고 DOM 노드 수가 상한을 넘지 않는다', async () => {
    renderTaskList()
    expect(await screen.findByText('할 일 1')).toBeInTheDocument()

    // 뷰포트 600px, 행 104px, overscan 5 기준 윈도우 밖 항목은 DOM에 없다
    expect(screen.queryByText('할 일 12')).not.toBeInTheDocument()
    const renderedRows = screen.getByTestId('task-scroll').querySelectorAll('li')
    expect(renderedRows.length).toBeLessThanOrEqual(17)
  })

  it('목록 끝에 도달하면 다음 페이지를 이어 붙이고 그 위치의 윈도우를 보여준다', async () => {
    renderTaskList()
    await screen.findByText('할 일 1')

    // 20번째 행 근처로 스크롤한 상태를 만들고 스크롤 이벤트를 발생시킨다
    const scroll = screen.getByTestId('task-scroll')
    scroll.scrollTop = 2_080
    fireEvent.scroll(scroll)

    expect(await screen.findByText('할 일 21')).toBeInTheDocument()
    // 앞쪽 항목은 윈도우 밖으로 나가 DOM에서 사라진다 (가상 스크롤)
    expect(screen.queryByText('할 일 1')).not.toBeInTheDocument()
  })

  it('카드를 클릭하면 해당 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    const router = renderTaskList()
    await user.click(await screen.findByText('할 일 3'))
    expect(router.state.location.pathname).toBe('/task/3')
  })

  it('할 일이 없으면 빈 상태를 보여준다', async () => {
    server.use(
      http.get('/api/task', () => HttpResponse.json({ data: [], hasNext: false })),
    )
    renderTaskList()
    expect(await screen.findByText('표시할 할 일이 없습니다')).toBeInTheDocument()
  })

  it('목록 요청이 실패하면 에러 상태와 다시 시도를 보여준다', async () => {
    server.use(
      http.get(
        '/api/task',
        () => HttpResponse.json({ errorMessage: '서버 오류' }, { status: 500 }),
        { once: true },
      ),
    )
    const user = userEvent.setup()
    renderTaskList()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '할 일 목록을 불러오지 못했습니다',
    )
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('할 일 1')).toBeInTheDocument()
  })
})
