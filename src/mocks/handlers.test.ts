import { describe, expect, it } from 'vitest'
import { demoAccount } from './seed'
import { createToken, decodeToken } from './token'

// 전역 fetch(undici)는 상대 경로를 못 쓴다. 핸들러의 상대 경로는 jsdom의
// origin 기준으로 매칭되므로 같은 origin을 붙인다
const BASE = location.origin

async function signIn(email: string, password: string) {
  return fetch(`${BASE}/api/sign-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
}

async function issueAccessToken(): Promise<string> {
  const response = await signIn(demoAccount.email, demoAccount.password)
  const body: unknown = await response.json()
  if (
    typeof body === 'object' &&
    body !== null &&
    'accessToken' in body &&
    typeof body.accessToken === 'string'
  ) {
    return body.accessToken
  }
  throw new Error('토큰 발급 실패')
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

describe('sign-in', () => {
  it('데모 계정으로 로그인하면 두 토큰을 발급하고 페이로드에 id와 exp가 있다', async () => {
    const response = await signIn(demoAccount.email, demoAccount.password)
    expect(response.status).toBe(200)
    const body = await response.json()
    const payload = decodeToken(body.accessToken)
    expect(payload).not.toBeNull()
    expect(payload?.id).toBeTruthy()
    expect(payload?.exp).toBeGreaterThan(Date.now() / 1000)
    expect(decodeToken(body.refreshToken)).not.toBeNull()
  })

  it('자격 증명이 틀리면 400과 errorMessage를 준다', async () => {
    const response = await signIn(demoAccount.email, 'wrongpass1')
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(typeof body.errorMessage).toBe('string')
  })
})

describe('refresh', () => {
  it('쿠키의 refresh 토큰이 유효하면 새 토큰 쌍을 준다', async () => {
    const refreshToken = createToken('demo-user', 60_000)
    const response = await fetch(`${BASE}/api/refresh`, {
      method: 'POST',
      headers: { Cookie: `token=${refreshToken}` },
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(typeof body.accessToken).toBe('string')
    expect(typeof body.refreshToken).toBe('string')
  })

  it('쿠키가 없으면 401을 준다', async () => {
    const response = await fetch(`${BASE}/api/refresh`, { method: 'POST' })
    expect(response.status).toBe(401)
  })

  it('만료된 refresh 토큰이면 401을 준다', async () => {
    const expired = createToken('demo-user', -1_000)
    const response = await fetch(`${BASE}/api/refresh`, {
      method: 'POST',
      headers: { Cookie: `token=${expired}` },
    })
    expect(response.status).toBe(401)
  })
})

describe('bearer 보호', () => {
  it('토큰 없이 호출하면 401을 준다', async () => {
    const response = await fetch(`${BASE}/api/task?page=1`)
    expect(response.status).toBe(401)
  })

  it('만료된 access 토큰이면 401을 준다', async () => {
    const expired = createToken('demo-user', -1_000)
    const response = await fetch(`${BASE}/api/task?page=1`, { headers: authHeaders(expired) })
    expect(response.status).toBe(401)
  })
})

describe('task 목록', () => {
  it('페이지당 20건을 주고 다음 페이지 유무를 알려준다', async () => {
    const token = await issueAccessToken()
    const response = await fetch(`${BASE}/api/task?page=1`, { headers: authHeaders(token) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(20)
    expect(body.hasNext).toBe(true)
    expect(body.data[0]).toMatchObject({ id: '1', title: '할 일 1' })
  })

  it('마지막 페이지는 hasNext가 false다', async () => {
    const token = await issueAccessToken()
    const response = await fetch(`${BASE}/api/task?page=25`, { headers: authHeaders(token) })
    const body = await response.json()
    expect(body.data).toHaveLength(20)
    expect(body.hasNext).toBe(false)
  })
})

describe('task 상세와 삭제', () => {
  it('상세는 title, memo, registerDatetime을 준다', async () => {
    const token = await issueAccessToken()
    const response = await fetch(`${BASE}/api/task/1`, { headers: authHeaders(token) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.title).toBe('할 일 1')
    expect(typeof body.memo).toBe('string')
    expect(new Date(body.registerDatetime).getTime()).not.toBeNaN()
  })

  it('없는 id의 상세는 404를 준다', async () => {
    const token = await issueAccessToken()
    const response = await fetch(`${BASE}/api/task/999999`, { headers: authHeaders(token) })
    expect(response.status).toBe(404)
  })

  it('삭제하면 success를 주고 이후 상세는 404가 된다', async () => {
    const token = await issueAccessToken()
    const deleted = await fetch(`${BASE}/api/task/3`, {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(deleted.status).toBe(200)
    const body = await deleted.json()
    expect(body.success).toBe(true)

    const detail = await fetch(`${BASE}/api/task/3`, { headers: authHeaders(token) })
    expect(detail.status).toBe(404)
  })

  it('삭제는 대시보드 갯수에 반영된다', async () => {
    const token = await issueAccessToken()
    await fetch(`${BASE}/api/task/1`, { method: 'DELETE', headers: authHeaders(token) })
    const response = await fetch(`${BASE}/api/dashboard`, { headers: authHeaders(token) })
    const body = await response.json()
    expect(body.numOfTask).toBe(499)
    expect(body.numOfRestTask + body.numOfDoneTask).toBe(499)
  })
})

describe('테스트 간 시드 격리', () => {
  it('앞 테스트에서 삭제한 할 일이 복구되어 있다', async () => {
    const token = await issueAccessToken()
    const response = await fetch(`${BASE}/api/task/3`, { headers: authHeaders(token) })
    expect(response.status).toBe(200)
  })
})
