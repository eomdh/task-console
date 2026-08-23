import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

export type DashboardResponse = components['schemas']['DashboardResponse']

export function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/api/dashboard')
}
