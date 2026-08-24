import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

export type DeleteTaskResponse = components['schemas']['DeleteTaskResponse']

export function deleteTask(id: string): Promise<DeleteTaskResponse> {
  return request<DeleteTaskResponse>(`/api/task/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
