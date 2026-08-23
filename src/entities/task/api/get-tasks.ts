import { request } from '@/shared/lib/http'
import type { components } from '@/shared/api/openapi.gen'

export type TaskItem = components['schemas']['TaskItem']
export type TaskListResponse = components['schemas']['TaskListResponse']

export function getTasks(page: number): Promise<TaskListResponse> {
  return request<TaskListResponse>(`/api/task?page=${page}`)
}
