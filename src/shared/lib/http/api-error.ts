// API 실패를 status와 스펙의 errorMessage로 정규화한다.
// 화면 분기(400 모달, 404 화면)는 전부 이 타입 하나로 한다
export class ApiError extends Error {
  readonly status: number
  readonly errorMessage: string

  constructor(status: number, errorMessage: string) {
    super(errorMessage)
    this.name = 'ApiError'
    this.status = status
    this.errorMessage = errorMessage
  }
}
