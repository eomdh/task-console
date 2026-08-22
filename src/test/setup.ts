import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest globals를 끈 상태라 RTL 자동 cleanup이 동작하지 않아 직접 연결한다
afterEach(() => {
  cleanup()
})
