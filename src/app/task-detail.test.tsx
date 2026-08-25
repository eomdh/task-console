import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { demoAccount } from '@/mocks/seed'
import { createToken } from '@/mocks/token'
import { tokenStore } from '@/shared/lib/http'
import { createAppRouter } from './router'

// 히스토리 앞부분이 착지 지점에 영향을 주는 케이스가 있어 여러 항목을 받는다
function renderAt(path: string | string[]) {
  const initialEntries = Array.isArray(path) ? path : [path]
  const router = createAppRouter(createMemoryHistory({ initialEntries }))
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

describe('할 일 상세', () => {
  it('제목과 메모, 등록 시각을 보여준다', async () => {
    renderAt('/task/1')
    expect(await screen.findByRole('heading', { name: '할 일 1' })).toBeInTheDocument()
    expect(screen.getByText('1번 할 일의 메모')).toBeInTheDocument()
    // 시각 표기는 실행 환경의 표준 시간대를 타므로 연도만 확인한다
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('목록으로 버튼을 누르면 목록으로 돌아간다', async () => {
    const user = userEvent.setup()
    const router = renderAt('/task/2')
    await screen.findByRole('heading', { name: '할 일 2' })

    await user.click(screen.getByRole('button', { name: '목록으로' }))
    expect(router.state.location.pathname).toBe('/task')
  })

  it('없는 id면 리소스 없음 화면과 목록 복귀 버튼을 보여준다', async () => {
    const user = userEvent.setup()
    const router = renderAt('/task/9999')

    expect(await screen.findByRole('alert')).toHaveTextContent('요청한 할 일이 없습니다')
    // 404에는 다시 시도를 두지 않는다
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '목록으로 돌아가기' }))
    expect(router.state.location.pathname).toBe('/task')
  })

  it('id를 입력해 삭제하면 목록으로 보내고 안내와 함께 항목이 사라진다', async () => {
    const user = userEvent.setup()
    const router = renderAt('/task/3')
    await screen.findByRole('heading', { name: '할 일 3' })

    await user.click(screen.getByRole('button', { name: /삭제/ }))
    await user.type(screen.getByLabelText('할 일 번호'), '3')
    await user.click(screen.getByRole('button', { name: '제출' }))

    expect(await screen.findByText('할 일이 삭제되었습니다')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/task')
    // 목록 캐시가 무효화되어 지운 항목이 빠진 채로 다시 그려진다
    expect(await screen.findByText('할 일 1')).toBeInTheDocument()
    expect(screen.queryByText('할 일 3')).not.toBeInTheDocument()

    // 자동 소거를 기다리지 않고 직접 닫을 수 있다
    await user.click(screen.getByRole('button', { name: '닫기' }))
    expect(screen.queryByText('할 일이 삭제되었습니다')).not.toBeInTheDocument()
  })

  it('로그인을 거쳐 들어와도 목록으로 버튼이 로그인 화면으로 되돌리지 않는다', async () => {
    // 가드가 로그인으로 보냈다 돌아온 경로. 로그인 화면이 히스토리에 남아 있으면
    // 뒤로가기 한 칸이 목록이 아니라 로그인이 된다
    tokenStore.clear()
    const user = userEvent.setup()
    const router = renderAt('/task/7')

    await screen.findByRole('heading', { name: '로그인' })
    await user.type(screen.getByLabelText('이메일'), demoAccount.email)
    await user.type(screen.getByLabelText('비밀번호'), demoAccount.password)
    await user.click(screen.getByRole('button', { name: '로그인' }))
    await screen.findByRole('heading', { name: '할 일 7' })

    await user.click(screen.getByRole('button', { name: '목록으로' }))
    expect(router.state.location.pathname).toBe('/task')
  })

  it('직전 화면이 목록이 아니어도 삭제하면 목록으로 가고 안내가 뜬다', async () => {
    // 삭제는 뒤로가기를 쓰지 않는다. 직전 항목이 목록이라는 가정에 기대면
    // 요구사항의 "목록으로 redirect"가 조건부가 되고 안내도 유실된다
    const user = userEvent.setup()
    const router = renderAt(['/user', '/task/5'])
    await screen.findByRole('heading', { name: '할 일 5' })

    await user.click(screen.getByRole('button', { name: /삭제/ }))
    await user.type(screen.getByLabelText('할 일 번호'), '5')
    await user.click(screen.getByRole('button', { name: '제출' }))

    expect(router.state.location.pathname).toBe('/task')
    expect(await screen.findByText('할 일이 삭제되었습니다')).toBeInTheDocument()
  })

  it('404가 아닌 실패는 다시 시도로 복구된다', async () => {
    server.use(
      http.get(
        '/api/task/:id',
        () => HttpResponse.json({ errorMessage: '서버 오류' }, { status: 500 }),
        { once: true },
      ),
    )
    const user = userEvent.setup()
    renderAt('/task/2')

    expect(await screen.findByRole('alert')).toHaveTextContent('할 일을 불러오지 못했습니다')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('heading', { name: '할 일 2' })).toBeInTheDocument()
  })
})
