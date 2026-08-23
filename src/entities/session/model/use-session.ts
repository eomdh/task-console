import { useSyncExternalStore } from 'react'
import { sessionStore } from './store'

// 로그인 여부. 로그인과 로그아웃 즉시 구독 컴포넌트(GNB 등)가 갱신된다
export function useSession(): boolean {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.isAuthenticated)
}
