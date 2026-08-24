import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/mocks/server'
import { createToken } from '@/mocks/token'
import { tokenStore } from '@/shared/lib/http'
import { DeleteTask } from './delete-task'

// feature는 라우터를 모른다. 완료 통지만 검증하면 되므로 프로바이더도 Query 하나뿐
function renderDeleteTask() {
  const onDeleted = vi.fn()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <DeleteTask taskId="3" onDeleted={onDeleted} />
    </QueryClientProvider>,
  )
  return onDeleted
}

beforeEach(() => {
  tokenStore.save({
    accessToken: createToken('demo-user', 60_000),
    refreshToken: createToken('demo-user', 60_000),
  })
})

afterEach(() => {
  tokenStore.clear()
})

describe('DeleteTask', () => {
  it('삭제 버튼을 누르면 확인 모달이 열린다', async () => {
    const user = userEvent.setup()
    renderDeleteTask()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /삭제/ }))
    expect(screen.getByRole('dialog', { name: '할 일 삭제' })).toBeInTheDocument()
  })

  it('입력이 id와 정확히 같을 때만 제출이 활성화된다', async () => {
    const user = userEvent.setup()
    renderDeleteTask()
    await user.click(screen.getByRole('button', { name: /삭제/ }))

    const submit = screen.getByRole('button', { name: '제출' })
    expect(submit).toBeDisabled()

    const input = screen.getByLabelText('할 일 번호')
    await user.type(input, '4')
    expect(submit).toBeDisabled()

    await user.clear(input)
    await user.type(input, '3')
    expect(submit).toBeEnabled()
  })

  it('제출하면 삭제 후 완료를 알린다', async () => {
    const user = userEvent.setup()
    const onDeleted = renderDeleteTask()

    await user.click(screen.getByRole('button', { name: /삭제/ }))
    await user.type(screen.getByLabelText('할 일 번호'), '3')
    await user.click(screen.getByRole('button', { name: '제출' }))

    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1))
  })

  it('삭제가 실패하면 모달에 오류를 보여주고 완료를 알리지 않는다', async () => {
    server.use(
      http.delete('/api/task/:id', () =>
        HttpResponse.json({ errorMessage: '삭제할 수 없습니다' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    const onDeleted = renderDeleteTask()

    await user.click(screen.getByRole('button', { name: /삭제/ }))
    await user.type(screen.getByLabelText('할 일 번호'), '3')
    await user.click(screen.getByRole('button', { name: '제출' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('삭제할 수 없습니다')
    expect(onDeleted).not.toHaveBeenCalled()
  })
})
