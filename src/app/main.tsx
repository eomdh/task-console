import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import '@/app/styles/index.css'
import { configureHttp } from '@/shared/lib/http'
import { sessionStore } from '@/entities/session'
import { router } from '@/app/router'
import { AppProviders } from '@/app/providers'

// [데모 환경] 실제 백엔드가 없어 프로덕션 빌드에서도 MSW worker를 기동한다.
// 실제 서비스라면 이 코드 자체가 존재하지 않는다.
const { worker } = await import('@/mocks/browser')
await worker.start({ onUnhandledRequest: 'bypass' })

// 세션 만료 시 구독자(GNB) 갱신과 이동은 app 레이어가 정한다
configureHttp({
  onSessionExpired: () => {
    sessionStore.end()
    void router.navigate({ to: '/sign-in' })
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('root 요소가 없습니다')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)
