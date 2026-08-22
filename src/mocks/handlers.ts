import { http, HttpResponse } from 'msw'
import type { components } from '@/shared/api/openapi.gen'
import { createToken, decodeToken, isExpired } from './token'
import { demoAccount, demoUser, findTask, getTasks, removeTask } from './seed'

type SignInRequest = components['schemas']['SignInRequest']
type AuthTokenResponse = components['schemas']['AuthTokenResponse']
type ErrorResponse = components['schemas']['ErrorResponse']
type UserResponse = components['schemas']['UserResponse']
type DashboardResponse = components['schemas']['DashboardResponse']
type TaskListResponse = components['schemas']['TaskListResponse']
type TaskDetailResponse = components['schemas']['TaskDetailResponse']
type DeleteTaskResponse = components['schemas']['DeleteTaskResponse']

const ACCESS_LIFETIME_MS = 5 * 60 * 1000
const REFRESH_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000
// 스펙에 페이지 크기가 없어 20으로 정한다. 근거는 README 설계 결정 참고
const PAGE_SIZE = 20
const USER_ID = 'demo-user'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_PATTERN = /^[A-Za-z0-9]{8,24}$/

function issueTokens(): AuthTokenResponse {
  return {
    accessToken: createToken(USER_ID, ACCESS_LIFETIME_MS),
    refreshToken: createToken(USER_ID, REFRESH_LIFETIME_MS),
  }
}

function errorBody(errorMessage: string): ErrorResponse {
  return { errorMessage }
}

// bearer 토큰 검사. 실패하면 401 응답을, 통과하면 null을 돌려준다
function rejectUnauthorized(request: Request): HttpResponse<ErrorResponse> | null {
  const header = request.headers.get('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null
  if (!token) {
    return HttpResponse.json(errorBody('인증이 필요합니다'), { status: 401 })
  }
  const payload = decodeToken(token)
  if (!payload || isExpired(payload)) {
    return HttpResponse.json(errorBody('토큰이 만료되었거나 올바르지 않습니다'), { status: 401 })
  }
  return null
}

export const handlers = [
  http.post<never, SignInRequest, AuthTokenResponse | ErrorResponse>(
    '/api/sign-in',
    async ({ request }) => {
      const body = await request.json()
      if (!EMAIL_PATTERN.test(body.email) || !PASSWORD_PATTERN.test(body.password)) {
        return HttpResponse.json(errorBody('입력 형식이 올바르지 않습니다'), { status: 400 })
      }
      if (body.email !== demoAccount.email || body.password !== demoAccount.password) {
        return HttpResponse.json(errorBody('이메일 또는 비밀번호가 올바르지 않습니다'), {
          status: 400,
        })
      }
      return HttpResponse.json(issueTokens())
    },
  ),

  // [데모 환경] refresh 토큰은 httpOnly 쿠키가 원칙이나 MSW로는 흉내낼 수 없어
  // 일반 쿠키(이름은 openapi 명세대로 token)를 읽는다. 실제 서비스에서는
  // 서버가 Set-Cookie(httpOnly)로 내려주고 브라우저가 자동 전송한다.
  http.post<never, never, AuthTokenResponse | ErrorResponse>('/api/refresh', ({ cookies }) => {
    const refreshToken = cookies['token']
    if (!refreshToken) {
      return HttpResponse.json(errorBody('refresh 토큰이 없습니다'), { status: 401 })
    }
    const payload = decodeToken(refreshToken)
    if (!payload || isExpired(payload)) {
      return HttpResponse.json(errorBody('refresh 토큰이 만료되었거나 올바르지 않습니다'), {
        status: 401,
      })
    }
    return HttpResponse.json(issueTokens())
  }),

  http.get<never, never, UserResponse | ErrorResponse>('/api/user', ({ request }) => {
    const rejected = rejectUnauthorized(request)
    if (rejected) return rejected
    return HttpResponse.json(demoUser)
  }),

  http.get<never, never, DashboardResponse | ErrorResponse>('/api/dashboard', ({ request }) => {
    const rejected = rejectUnauthorized(request)
    if (rejected) return rejected
    const tasks = getTasks()
    const numOfDoneTask = tasks.filter((task) => task.status === 'DONE').length
    return HttpResponse.json({
      numOfTask: tasks.length,
      numOfRestTask: tasks.length - numOfDoneTask,
      numOfDoneTask,
    })
  }),

  http.get<never, never, TaskListResponse | ErrorResponse>('/api/task', ({ request }) => {
    const rejected = rejectUnauthorized(request)
    if (rejected) return rejected
    const pageParam = Number(new URL(request.url).searchParams.get('page'))
    const page = Number.isInteger(pageParam) && pageParam >= 1 ? pageParam : 1
    const tasks = getTasks()
    const start = (page - 1) * PAGE_SIZE
    const data = tasks
      .slice(start, start + PAGE_SIZE)
      .map(({ id, title, memo, status }) => ({ id, title, memo, status }))
    return HttpResponse.json({ data, hasNext: start + PAGE_SIZE < tasks.length })
  }),

  http.get<{ id: string }, never, TaskDetailResponse | ErrorResponse>(
    '/api/task/:id',
    ({ request, params }) => {
      const rejected = rejectUnauthorized(request)
      if (rejected) return rejected
      const task = findTask(params.id)
      if (!task) {
        return HttpResponse.json(errorBody('해당 할 일을 찾을 수 없습니다'), { status: 404 })
      }
      return HttpResponse.json({
        title: task.title,
        memo: task.memo,
        registerDatetime: task.registerDatetime,
      })
    },
  ),

  http.delete<{ id: string }, never, DeleteTaskResponse | ErrorResponse>(
    '/api/task/:id',
    ({ request, params }) => {
      const rejected = rejectUnauthorized(request)
      if (rejected) return rejected
      const removed = removeTask(params.id)
      if (!removed) {
        return HttpResponse.json(errorBody('해당 할 일을 찾을 수 없습니다'), { status: 404 })
      }
      return HttpResponse.json({ success: true })
    },
  ),
]
