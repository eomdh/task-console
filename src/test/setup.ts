import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { server } from '@/mocks/server'
import { resetTasks } from '@/mocks/seed'

// 핸들러에 없는 요청은 테스트 작성 오류이므로 즉시 실패시킨다
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
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
