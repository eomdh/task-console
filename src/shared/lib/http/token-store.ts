export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// [데모 환경] accessToken은 메모리, refreshToken은 일반 쿠키(token)에 보관한다.
// 실제 서비스에서는 refresh 토큰을 서버가 httpOnly 쿠키로 관리하므로
// 클라이언트가 쿠키를 직접 쓰는 이 코드 전체가 사라진다.
let accessToken: string | null = null

const REFRESH_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

export const tokenStore = {
  save(tokens: AuthTokens): void {
    accessToken = tokens.accessToken
    document.cookie = `token=${tokens.refreshToken}; path=/; max-age=${REFRESH_COOKIE_MAX_AGE_SECONDS}; samesite=lax`
  },

  getAccessToken(): string | null {
    return accessToken
  },

  clear(): void {
    accessToken = null
    document.cookie = 'token=; path=/; max-age=0'
  },
}
