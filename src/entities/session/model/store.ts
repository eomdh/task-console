import { tokenStore } from '@/shared/lib/http'
import type { AuthTokens } from '@/shared/lib/http'

// tokenStore는 알림 기능이 없는 순수 보관소라, 세션 변화 구독은 여기서 담당한다
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const sessionStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  isAuthenticated(): boolean {
    return Boolean(tokenStore.getAccessToken())
  },

  start(tokens: AuthTokens): void {
    tokenStore.save(tokens)
    notify()
  },

  end(): void {
    tokenStore.clear()
    notify()
  },
}
