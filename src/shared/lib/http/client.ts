export interface HttpOptions {
  // refresh 최종 실패 시 호출. 라우팅은 app 레이어의 몫이라 콜백으로 주입받는다
  onSessionExpired: () => void
}

// red 단계 스텁. 스펙은 client.test.ts, 구현은 green 커밋에서
export function configureHttp(options: HttpOptions): void {
  void options
  throw new Error('미구현: green 커밋에서 구현')
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  void path
  void init
  throw new Error('미구현: green 커밋에서 구현')
}
