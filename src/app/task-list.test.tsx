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
})

afterEach(() => {
  tokenStore.clear()
})

describe('할 일 목록', () => {
  it('첫 페이지 20건을 카드로 보여준다', async () => {
    renderTaskList()
    expect(await screen.findByText('할 일 1')).toBeInTheDocument()
    expect(screen.getByText('할 일 20')).toBeInTheDocument()
    expect(screen.queryByText('할 일 21')).not.toBeInTheDocument()
  })

  it('목록 끝에 도달하면 다음 페이지를 이어 붙인다', async () => {
    renderTaskList()
    await screen.findByText('할 일 1')

    // jsdom은 레이아웃이 없어 스크롤 이벤트만으로 끝 도달로 판정된다
    fireEvent.scroll(screen.getByTestId('task-scroll'))
    expect(await screen.findByText('할 일 21')).toBeInTheDocument()
    // 기존 페이지는 유지된다
    expect(screen.getByText('할 일 1')).toBeInTheDocument()
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
