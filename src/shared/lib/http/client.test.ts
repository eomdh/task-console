import { beforeEach, describe, expect, it, vi } from 'vitest'
import { delay, http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createToken } from '@/mocks/token'
import { demoUser } from '@/mocks/seed'
import { ApiError } from './api-error'
import { tokenStore } from './token-store'
import { configureHttp, request } from './client'

interface UserBody {
  name: string
  memo: string
}

const onSessionExpired = vi.fn()

// refresh 핸들러를 호출 횟수 계수용으로 덮는다. 반환값으로 성공/실패를 정한다
function overrideRefresh(result: 'success' | 'failure') {
  const calls = { count: 0 }
  server.use(
    http.post('/api/refresh', async () => {
      calls.count += 1
      // 동시 요청이 한 갱신을 공유하는지 보려면 경합 창이 필요하다
      await delay(20)
      if (result === 'failure') {
        return HttpResponse.json({ errorMessage: 'refresh 실패' }, { status: 401 })
      }
      return HttpResponse.json({
        accessToken: createToken('demo-user', 60_000),
        refreshToken: createToken('demo-user', 60_000),
      })
    }),
  )
  return calls
}

function saveValidTokens() {
  const accessToken = createToken('demo-user', 60_000)
  tokenStore.save({ accessToken, refreshToken: createToken('demo-user', 60_000) })
  return accessToken
}

function saveExpiredAccessToken() {
  tokenStore.save({
    accessToken: createToken('demo-user', -1_000),
    refreshToken: createToken('demo-user', 60_000),
  })
}

beforeEach(() => {
  onSessionExpired.mockClear()
  configureHttp({ onSessionExpired })
  tokenStore.clear()
})

describe('tokenStore', () => {
  it('저장하면 accessToken은 메모리에서 읽히고 refreshToken은 쿠키(token)에 남는다', () => {
    const accessToken = saveValidTokens()
    expect(tokenStore.getAccessToken()).toBe(accessToken)
    expect(document.cookie).toContain('token=')

    tokenStore.clear()
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(document.cookie).not.toContain('token=')
  })
})

describe('request', () => {
  it('저장된 accessToken을 bearer로 첨부한다', async () => {
    const accessToken = saveValidTokens()
    let seenAuthorization: string | null = null
    server.use(
      http.get('/api/user', ({ request: req }) => {
        seenAuthorization = req.headers.get('Authorization')
        return HttpResponse.json(demoUser)
      }),
    )

    await request<UserBody>('/api/user')
    expect(seenAuthorization).toBe(`Bearer ${accessToken}`)
  })

  it('401이 아닌 실패는 refresh 없이 ApiError로 전파된다', async () => {
    saveValidTokens()
    const refreshCalls = overrideRefresh('success')

    const promise = request<never>('/api/task/999999')
    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({ status: 404 })
    expect(refreshCalls.count).toBe(0)
  })
})

describe('401 갱신과 재시도', () => {
  it('401을 받으면 refresh 후 새 토큰으로 원요청을 재시도해 성공을 돌려준다', async () => {
    saveExpiredAccessToken()
    const refreshCalls = overrideRefresh('success')

    const user = await request<UserBody>('/api/user')
    expect(user).toEqual(demoUser)
    expect(refreshCalls.count).toBe(1)
    // 갱신된 토큰이 저장되어 다음 요청은 refresh 없이 성공한다
    await request<UserBody>('/api/user')
    expect(refreshCalls.count).toBe(1)
  })

  it('동시에 여러 요청이 401을 받아도 refresh는 1회만 나간다', async () => {
    saveExpiredAccessToken()
    const refreshCalls = overrideRefresh('success')

    const [user, dashboard] = await Promise.all([
      request<UserBody>('/api/user'),
      request<{ numOfTask: number }>('/api/dashboard'),
    ])
    expect(user).toEqual(demoUser)
    expect(dashboard.numOfTask).toBe(500)
    expect(refreshCalls.count).toBe(1)
  })

  it('refresh가 실패하면 토큰을 지우고 세션 만료를 1회만 알린다', async () => {
    saveExpiredAccessToken()
    overrideRefresh('failure')

    const results = await Promise.allSettled([
      request<UserBody>('/api/user'),
      request<{ numOfTask: number }>('/api/dashboard'),
    ])
    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(onSessionExpired).toHaveBeenCalledTimes(1)
    expect(tokenStore.getAccessToken()).toBeNull()
    expect(document.cookie).not.toContain('token=')
  })

  it('재시도한 요청이 다시 401이면 추가 refresh 없이 실패한다', async () => {
    saveExpiredAccessToken()
    const refreshCalls = overrideRefresh('success')
    // 새 토큰으로도 401을 주는 서버 상황을 흉내낸다
    server.use(
      http.get('/api/user', () =>
        HttpResponse.json({ errorMessage: '권한 없음' }, { status: 401 }),
      ),
    )

    const promise = request<UserBody>('/api/user')
    await expect(promise).rejects.toBeInstanceOf(ApiError)
    await expect(promise).rejects.toMatchObject({ status: 401 })
    expect(refreshCalls.count).toBe(1)
  })
})
