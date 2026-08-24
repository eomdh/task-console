import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

export type UserResponse = components['schemas']['UserResponse']

export function getUser(): Promise<UserResponse> {
  return request<UserResponse>('/api/user')
}
