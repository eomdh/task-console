import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

type SignInRequest = components['schemas']['SignInRequest']
type AuthTokenResponse = components['schemas']['AuthTokenResponse']

export function requestSignIn(body: SignInRequest): Promise<AuthTokenResponse> {
  return request<AuthTokenResponse>('/api/sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
