import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/index.css'

// [데모 환경] 실제 백엔드가 없어 프로덕션 빌드에서도 MSW worker를 기동한다.
// 실제 서비스라면 이 코드 자체가 존재하지 않는다.
const { worker } = await import('@/mocks/browser')
await worker.start({ onUnhandledRequest: 'bypass' })

// 라우터 도입 전까지의 최소 진입점. 라우터 셸 커밋에서 교체한다.
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('root 요소가 없습니다')
}

createRoot(rootElement).render(
  <StrictMode>
    <main>task-console</main>
  </StrictMode>,
)
