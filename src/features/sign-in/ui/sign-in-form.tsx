import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSignIn, sessionStore } from '@/entities/session'
import { ApiError } from '@/shared/lib/http'
import { Button, Input, Modal } from '@/shared/ui'
import { signInSchema } from '../model/schema'
import type { SignInValues } from '../model/schema'

interface SignInFormProps {
  onSuccess: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    // 제출 버튼 활성화 조건(요구사항)을 위해 입력마다 검증한다
    mode: 'onChange',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = handleSubmit(async (values) => {
    try {
      const tokens = await requestSignIn(values)
      sessionStore.start(tokens)
      onSuccess()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.errorMessage : '로그인에 실패했습니다',
      )
    }
  })

  return (
    <>
      {/* 브라우저 기본 검증 대신 zod 메시지를 쓰기 위해 noValidate */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          placeholder="영문, 숫자 8자 이상"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" disabled={!isValid || isSubmitting} className="mt-2">
          로그인
        </Button>
      </form>
      <Modal
        open={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        title="로그인 실패"
      >
        <p className="text-sm text-ink-soft">{errorMessage}</p>
        <Button variant="ghost" onClick={() => setErrorMessage(null)}>
          확인
        </Button>
      </Modal>
    </>
  )
}
