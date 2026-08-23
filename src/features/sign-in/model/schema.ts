import { z } from 'zod'

// 비밀번호 규칙 "영문, 숫자로 구성"은 openapi 패턴(^[A-Za-z0-9]+$)대로
// 허용 문자 집합으로 해석한다. 근거는 README 설계 결정 참고
export const signInSchema = z.object({
  email: z.email('이메일 형식으로 입력해 주세요'),
  password: z
    .string()
    .regex(/^[A-Za-z0-9]{8,24}$/, '영문과 숫자로만 8자 이상 24자 이하로 입력해 주세요'),
})

export type SignInValues = z.infer<typeof signInSchema>
