import { useRouter, useSearch } from '@tanstack/react-router'
import { SignInPage } from '@/pages/sign-in'

// 로그인 성공 후 목적지는 라우팅 관심사라 app에서 정한다. 가드가 보존한 경로로 복귀.
// push가 아니라 replace를 쓰는 이유는 두 가지다. 로그인 화면은 뒤로가기로 되돌아갈
// 자리가 아니고, 스택에 남으면 상세에서 뒤로가기로 목록에 갈 때 로그인 화면이 먼저 나온다
export function SignInRouteComponent() {
  const { redirect: redirectTo } = useSearch({ from: '/sign-in' })
  const { history } = useRouter()
  return <SignInPage onSuccess={() => history.replace(redirectTo ?? '/')} />
}
