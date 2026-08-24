import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createToken } from '@/mocks/token'
import { configureHttp, tokenStore } from '@/shared/lib/http'
import { sessionStore } from './store'
import { restoreSession } from './restore-session'

const onSessionExpired = vi.fn()

beforeEach(() => {
  onSessionExpired.mockClear()
  configureHttp({ onSessionExpired })
  tokenStore.clear()
})

describe('restoreSession', () => {
  it('유효한 refresh 쿠키가 있으면 accessToken을 되살린다', async () => {
    document.cookie = `token=${createToken('demo-user', 60_000)}; path=/`

    await expect(restoreSession()).resolves.toBe(true)
    expect(sessionStore.isAuthenticated()).toBe(true)
  })

  it('쿠키가 없으면 복원하지 않고 세션 만료도 알리지 않는다', async () => {
    await expect(restoreSession()).resolves.toBe(false)
    expect(sessionStore.isAuthenticated()).toBe(false)
    // 부팅 실패는 만료가 아니라 비로그인 상태다. 여기서 알리면 첫 화면에서 이동이 발생한다
    expect(onSessionExpired).not.toHaveBeenCalled()
  })

  it('만료된 refresh 쿠키도 세션 만료로 알리지 않는다', async () => {
    document.cookie = `token=${createToken('demo-user', -1_000)}; path=/`

    await expect(restoreSession()).resolves.toBe(false)
    expect(sessionStore.isAuthenticated()).toBe(false)
    expect(onSessionExpired).not.toHaveBeenCalled()
  })
})
