import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from '@/mocks/server'
import { resetTasks } from '@/mocks/seed'

// findBy*의 기본 대기는 1초인데, 목 서버와 쿼리 왕복이 CPU 부하에서 이를 넘겨
// 간헐 실패가 났다. 실패를 늦게 알리더라도 거짓 실패를 없애는 쪽을 택한다
configure({ asyncUtilTimeout: 5_000 })

// 핸들러에 없는 요청은 테스트 작성 오류이므로 즉시 실패시킨다
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  // jsdom에 없는 scrollTo를 빈 함수로 대체해 라우터 스크롤 복원 소음을 막는다
  window.scrollTo = () => {}
})

afterEach(() => {
  server.resetHandlers()
  resetTasks()
  // vitest globals를 끈 상태라 RTL 자동 cleanup이 동작하지 않아 직접 연결한다
  cleanup()
})

afterAll(() => {
  server.close()
})
