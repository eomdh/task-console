import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

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
