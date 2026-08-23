import type { components } from '@/shared/api/openapi.gen'

type TaskItem = components['schemas']['TaskItem']

// 상세 응답의 registerDatetime까지 시드에 함께 보관한다
export interface SeedTask extends TaskItem {
  registerDatetime: string
}

// [데모 환경] 계정과 사용자 정보는 목 서버에 고정해둔다.
// 실제 서비스에서는 서버가 자격 증명을 검증하고 사용자 DB에서 조회한다.
export const demoAccount = {
  email: 'demo@example.com',
  password: 'password123',
}

export const demoUser: components['schemas']['UserResponse'] = {
  name: '홍길동',
  memo: 'task-console 데모 계정',
}

const TASK_COUNT = 500
// 시드가 실행 시점과 무관하게 같도록 기준 시각을 고정한다
const BASE_TIME = new Date('2026-08-01T09:00:00+09:00').getTime()

function createTasks(): SeedTask[] {
  return Array.from({ length: TASK_COUNT }, (_, index) => {
    const n = index + 1
    return {
      id: String(n),
      title: `할 일 ${n}`,
      memo:
        n % 5 === 0
          ? `${n}번 할 일의 메모. 카드 영역보다 길어지는 경우를 확인하기 위한 내용으로, 두 줄을 넘어가면 말줄임으로 잘리는지 보려고 일부러 문장을 길게 늘여 쓴다. 화면 폭이 넓어도 세 줄을 넘기도록 같은 취지의 문장을 몇 번 더 반복해 붙인다. 메모가 얼마나 길어지든 카드 높이는 고정이고 두 줄에서 잘려야 하며, 상세 페이지에 들어가야 전문을 읽을 수 있다. 이 문장까지 카드에서 보인다면 잘림 처리가 동작하지 않는 것이다.`
          : `${n}번 할 일의 메모`,
      status: n % 3 === 0 ? 'DONE' : 'TODO',
      registerDatetime: new Date(BASE_TIME - index * 3_600_000).toISOString(),
    }
  })
}

// [데모 환경] 시드는 메모리 보관이라 페이지 새로고침(worker 재기동) 시 초기화된다.
// 삭제 결과는 같은 세션 안에서만 유지된다.
let tasks = createTasks()

export function getTasks(): SeedTask[] {
  return tasks
}

export function findTask(id: string): SeedTask | undefined {
  return tasks.find((task) => task.id === id)
}

export function removeTask(id: string): boolean {
  const before = tasks.length
  tasks = tasks.filter((task) => task.id !== id)
  return tasks.length < before
}

// 테스트 간 격리를 위해 시드를 원상 복구한다
export function resetTasks(): void {
  tasks = createTasks()
}
