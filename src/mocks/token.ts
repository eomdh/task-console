// [데모 환경] 서명 검증이 없는 가짜 JWT. openapi 명세대로 페이로드에 id와 exp만 담는다.
// 실제 서비스에서는 서버가 비밀키로 서명하고, 클라이언트는 페이로드를 신뢰하지 않는다.

export interface TokenPayload {
  id: string
  exp: number
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value: string): string {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'))
}

export function createToken(id: string, lifetimeMs: number): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const payload: TokenPayload = {
    id,
    exp: Math.floor((Date.now() + lifetimeMs) / 1000),
  }
  return `${header}.${base64UrlEncode(JSON.stringify(payload))}.demo`
}

export function decodeToken(token: string): TokenPayload | null {
  const encodedPayload = token.split('.')[1]
  if (!encodedPayload) return null
  try {
    const parsed: unknown = JSON.parse(base64UrlDecode(encodedPayload))
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'id' in parsed &&
      typeof parsed.id === 'string' &&
      'exp' in parsed &&
      typeof parsed.exp === 'number'
    ) {
      return { id: parsed.id, exp: parsed.exp }
    }
    return null
  } catch {
    return null
  }
}

export function isExpired(payload: TokenPayload): boolean {
  return payload.exp * 1000 <= Date.now()
}
