import { useQueryClient } from '@tanstack/react-query'
import { sessionStore } from '@/entities/session'

export function useSignOut() {
  const queryClient = useQueryClient()

  return () => {
    sessionStore.end()
    // 캐시를 비우지 않으면 다음 로그인 직후 이전 사용자의 목록과 지표가 잠깐 보인다
    queryClient.clear()
  }
}
