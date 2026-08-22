export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// red 단계 스텁. 스펙은 client.test.ts, 구현은 green 커밋에서
export const tokenStore = {
  // [데모 환경] accessToken은 메모리, refreshToken은 일반 쿠키(token)에 보관한다.
  // 실제 서비스에서는 refresh 토큰을 서버가 httpOnly 쿠키로 관리한다.
  save(tokens: AuthTokens): void {
    void tokens
    throw new Error('미구현: green 커밋에서 구현')
  },

  getAccessToken(): string | null {
    throw new Error('미구현: green 커밋에서 구현')
  },

  clear(): void {
    throw new Error('미구현: green 커밋에서 구현')
  },
}
