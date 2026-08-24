import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createToken } from '@/mocks/token'
import { demoUser } from '@/mocks/seed'
import { tokenStore } from '@/shared/lib/http'
import { createAppRouter } from './router'

function renderUserPage() {
  const router = createAppRouter(createMemoryHistory({ initialEntries: ['/user'] }))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
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

describe('회원정보', () => {
  it('이름과 메모를 보여준다', async () => {
    renderUserPage()

    expect(await screen.findByText(demoUser.name)).toBeInTheDocument()
    expect(screen.getByText(demoUser.memo)).toBeInTheDocument()
    // 값마다 이름표가 붙는다
    expect(screen.getByText('이름')).toBeInTheDocument()
    expect(screen.getByText('메모')).toBeInTheDocument()
  })

  it('요청이 실패하면 에러 상태를 보여주고 다시 시도로 복구된다', async () => {
    server.use(
      http.get('/api/user', () => HttpResponse.json({ errorMessage: '서버 오류' }, { status: 500 }), {
        once: true,
      }),
    )
    const user = userEvent.setup()
    renderUserPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('회원정보를 불러오지 못했습니다')
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByText(demoUser.name)).toBeInTheDocument()
  })
})
