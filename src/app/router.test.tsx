import { afterEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { tokenStore } from '@/shared/lib/http'
import { createToken } from '@/mocks/token'
import { createAppRouter } from './router'

function renderAt(path: string) {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }))
  // 페이지가 useQuery를 쓰므로 실제 앱과 같은 프로바이더 구성으로 렌더한다
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return router
}

function signInForTest() {
  tokenStore.save({
    accessToken: createToken('demo-user', 60_000),
    refreshToken: createToken('demo-user', 60_000),
  })
}

afterEach(() => {
  tokenStore.clear()
})

describe('보호 라우트', () => {
  it('비로그인으로 대시보드에 가면 로그인 페이지로 보낸다', async () => {
    const router = renderAt('/')
    expect(await screen.findByRole('heading', { name: '로그인' })).toBeInTheDocument()
    // 원래 목적지가 redirect 쿼리에 보존된다
    expect(router.state.location.pathname).toBe('/sign-in')
  })

  it('로그인 상태면 대시보드가 그대로 열린다', async () => {
    signInForTest()
    renderAt('/')
    expect(await screen.findByRole('heading', { name: '대시보드' })).toBeInTheDocument()
  })
})

describe('GNB', () => {
  it('라우트 맵 링크와 비로그인 로그인 아이콘을 보여준다', async () => {
    renderAt('/sign-in')
    expect(await screen.findByRole('link', { name: /대시보드/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /할 일/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument()
  })

  it('로그인 상태면 회원정보 아이콘을 보여준다', async () => {
    signInForTest()
    renderAt('/user')
    expect(await screen.findByRole('heading', { name: '회원정보' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /회원정보/ })).toBeInTheDocument()
  })
})
