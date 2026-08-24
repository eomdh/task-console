import { ApiError } from './api-error'
import { tokenStore } from './token-store'
import type { AuthTokens } from './token-store'

export interface HttpOptions {
  // refresh 최종 실패 시 호출. 라우팅은 app 레이어의 몫이라 콜백으로 주입받는다
  onSessionExpired: () => void
}

let onSessionExpired: (() => void) | null = null
// 진행 중인 refresh를 공유해 동시 401에서 갱신이 한 번만 나가게 한다
let refreshPromise: Promise<boolean> | null = null

export function configureHttp(options: HttpOptions): void {
  onSessionExpired = options.onSessionExpired
  refreshPromise = null
}

function isAuthTokens(value: unknown): value is AuthTokens {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    'refreshToken' in value &&
    typeof value.refreshToken === 'string'
  )
}

function withAuthHeader(init: RequestInit | undefined): RequestInit {
  const headers = new Headers(init?.headers)
  const accessToken = tokenStore.getAccessToken()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return { ...init, headers }
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body: unknown = await response.json()
    if (
      typeof body === 'object' &&
      body !== null &&
      'errorMessage' in body &&
      typeof body.errorMessage === 'string'
    ) {
      return new ApiError(response.status, body.errorMessage)
    }
  } catch {
    // 본문이 없거나 JSON이 아닌 실패 응답. 상태 코드만 보존한다
  }
  return new ApiError(response.status, '요청이 실패했습니다')
}

// refresh 요청 1회. 저장과 실패 처리는 호출자가 정한다.
// 401 갱신과 부팅 시 세션 복원이 같은 요청을 쓰되 실패의 의미가 서로 다르기 때문
export async function requestRefreshTokens(): Promise<AuthTokens | null> {
  try {
    // 쿠키(token)는 same-origin 요청이라 브라우저가 자동 전송한다
    const response = await fetch(new URL('/api/refresh', location.origin), { method: 'POST' })
    if (response.ok) {
      const body: unknown = await response.json()
      if (isAuthTokens(body)) {
        return body
      }
    }
  } catch {
    // 네트워크 실패도 갱신 실패와 같게 처리한다
  }
  return null
}

async function executeRefresh(): Promise<boolean> {
  const tokens = await requestRefreshTokens()
  if (tokens) {
    tokenStore.save(tokens)
    return true
  }
  // 통지는 요청 수와 무관하게 refresh 실행당 1회
  tokenStore.clear()
  onSessionExpired?.()
  return false
}

function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = executeRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function parseBody<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await toApiError(response)
  }
  // 응답 본문 타입은 openapi 계약을 신뢰한다. 런타임 검증 없는 경계 캐스트는 여기 한 곳뿐
  const body: unknown = await response.json()
  return body as T
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = new URL(path, location.origin)
  const response = await fetch(url, withAuthHeader(init))
  if (response.status !== 401) {
    return parseBody<T>(response)
  }

  const refreshed = await refreshTokens()
  if (!refreshed) {
    throw await toApiError(response)
  }
  // 재시도는 1회뿐. 재시도가 다시 401이면 그대로 실패시켜 루프를 차단한다
  return parseBody<T>(await fetch(url, withAuthHeader(init)))
}
