import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { tokenStore } from '@/shared/lib/http'
import { demoAccount } from '@/mocks/seed'
import { SignInForm } from './sign-in-form'

afterEach(() => {
  tokenStore.clear()
})

describe('SignInForm', () => {
  it('라벨이 연결된 입력 2개와 비활성화된 제출 버튼으로 시작한다', () => {
    render(<SignInForm onSuccess={vi.fn()} />)
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
  })

  it('이메일 형식이 틀리면 aria-invalid와 알림 메시지를 보여주고 제출은 비활성 유지', async () => {
    const user = userEvent.setup()
    render(<SignInForm onSuccess={vi.fn()} />)

    await user.type(screen.getByLabelText('이메일'), 'not-an-email')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    const email = screen.getByLabelText('이메일')
    await waitFor(() => expect(email).toHaveAttribute('aria-invalid', 'true'))
    expect(screen.getByRole('alert')).toHaveTextContent('이메일 형식')
    expect(screen.getByRole('button', { name: '로그인' })).toBeDisabled()
  })

  it('두 입력이 조건을 만족하면 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    render(<SignInForm onSuccess={vi.fn()} />)

    await user.type(screen.getByLabelText('이메일'), demoAccount.email)
    await user.type(screen.getByLabelText('비밀번호'), demoAccount.password)

    await waitFor(() =>
      expect(screen.getByRole('button', { name: '로그인' })).toBeEnabled(),
    )
  })

  it('로그인에 성공하면 토큰을 저장하고 onSuccess를 호출한다', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<SignInForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('이메일'), demoAccount.email)
    await user.type(screen.getByLabelText('비밀번호'), demoAccount.password)
    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(tokenStore.getAccessToken()).toBeTruthy()
  })

  it('자격 증명이 틀리면 서버 errorMessage를 모달로 보여주고 Escape로 닫힌다', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<SignInForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText('이메일'), demoAccount.email)
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpass12')
    await user.click(screen.getByRole('button', { name: '로그인' }))

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('이메일 또는 비밀번호가 올바르지 않습니다')
    expect(onSuccess).not.toHaveBeenCalled()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
