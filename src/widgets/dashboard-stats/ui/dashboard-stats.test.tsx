import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createToken } from '@/mocks/token'
import { tokenStore } from '@/shared/lib/http'
import { DashboardStats } from './dashboard-stats'

function renderWithQuery(ui: React.ReactElement) {
  // 테스트 간 캐시 공유를 막기 위해 매번 새 클라이언트를 만든다
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
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

describe('DashboardStats', () => {
  it('로딩 상태를 먼저 보여주고 지표 3개를 렌더한다', async () => {
    renderWithQuery(<DashboardStats />)
    expect(screen.getByRole('status', { name: '대시보드 불러오는 중' })).toBeInTheDocument()

    // 시드 500건, 3의 배수만 DONE이라 166건
    expect(await screen.findByText('일')).toBeInTheDocument()
    expect(screen.getByText('해야할 일')).toBeInTheDocument()
    expect(screen.getByText('한 일')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('334')).toBeInTheDocument()
    expect(screen.getByText('166')).toBeInTheDocument()
  })

  it('요청이 실패하면 에러 상태를 보여주고 다시 시도로 복구한다', async () => {
    server.use(
      http.get(
        '/api/dashboard',
        () => HttpResponse.json({ errorMessage: '서버 오류' }, { status: 500 }),
        { once: true },
      ),
    )
    const user = userEvent.setup()
    renderWithQuery(<DashboardStats />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('대시보드를 불러오지 못했습니다')

    // once 오버라이드가 소진되어 재시도는 실제 핸들러가 받는다
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText('500')).toBeInTheDocument()
  })
})
