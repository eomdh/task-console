import { requestRefreshTokens } from '@/shared/lib/http'
import { sessionStore } from './store'

// accessToken은 메모리에만 있어 새로고침이나 딥링크 진입에서 사라진다. 부팅 시 쿠키의
// refresh 토큰으로 1회 복원하고, 실패는 만료가 아니라 비로그인이라 세션 만료를 알리지 않는다.
// 실제 서비스의 refresh 쿠키는 httpOnly라 존재를 확인할 수 없으므로 조건 없이 시도한다
export async function restoreSession(): Promise<boolean> {
  const tokens = await requestRefreshTokens()
  if (!tokens) return false
  sessionStore.start(tokens)
  return true
}
