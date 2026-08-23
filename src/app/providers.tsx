import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// 401 갱신 재시도는 http 클라이언트가 담당하므로 Query 레벨 재시도는 끈다.
// 실패는 즉시 에러 상태로 노출하고 화면의 다시 시도 버튼으로 복구한다
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
