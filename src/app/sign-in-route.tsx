import { useRouter, useSearch } from '@tanstack/react-router'
import { SignInPage } from '@/pages/sign-in'

// 로그인 성공 후 목적지는 라우팅 관심사라 app에서 정한다. 가드가 보존한 경로로 복귀
export function SignInRouteComponent() {
  const { redirect: redirectTo } = useSearch({ from: '/sign-in' })
  const { history } = useRouter()
  return <SignInPage onSuccess={() => history.push(redirectTo ?? '/')} />
}
