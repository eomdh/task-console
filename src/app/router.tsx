import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import type { RouterHistory } from '@tanstack/react-router'
import { tokenStore } from '@/shared/lib/http'
import { DashboardPage } from '@/pages/dashboard'
import { TaskDetailPage } from '@/pages/task-detail'
import { TaskListPage } from '@/pages/task-list'
import { UserPage } from '@/pages/user'
import { RootLayout } from './root-layout'
import { SignInRouteComponent } from './sign-in-route'

const rootRoute = createRootRoute({ component: RootLayout })

// 비로그인 접근은 로그인으로 보내고 원래 목적지를 redirect 쿼리에 보존한다
function requireAuth({ location }: { location: { href: string } }) {
  if (!tokenStore.getAccessToken()) {
    throw redirect({ to: '/sign-in', search: { redirect: location.href } })
  }
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireAuth,
  component: DashboardPage,
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  // redirect는 선택 파라미터. 필수로 추론되면 모든 Link가 search를 요구하게 된다
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === 'string' ? { redirect: search.redirect } : {},
  component: SignInRouteComponent,
})

const taskListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/task',
  beforeLoad: requireAuth,
  component: TaskListPage,
})

const taskDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/task/$taskId',
  beforeLoad: requireAuth,
  component: TaskDetailPage,
})

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user',
  beforeLoad: requireAuth,
  component: UserPage,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  signInRoute,
  taskListRoute,
  taskDetailRoute,
  userRoute,
])

// 테스트가 memory history로 라우터를 격리 생성할 수 있게 팩토리로 둔다
export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, ...(history ? { history } : {}) })
}

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
