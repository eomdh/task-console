import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

export type TaskDetailResponse = components['schemas']['TaskDetailResponse']

export function getTaskDetail(id: string): Promise<TaskDetailResponse> {
  return request<TaskDetailResponse>(`/api/task/${encodeURIComponent(id)}`)
}
