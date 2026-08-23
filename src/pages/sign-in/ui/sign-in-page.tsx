import { SignInForm } from '@/features/sign-in'

interface SignInPageProps {
  onSuccess: () => void
}

export function SignInPage({ onSuccess }: SignInPageProps) {
  return (
    // m-auto는 GNB 아래 영역의 중앙이라 화면 중심보다 GNB 절반만큼 낮다.
    // 뷰포트 기준 정중앙이 되도록 GNB 높이(h-16)의 절반을 올린다
    <section className="m-auto w-full max-w-sm -translate-y-8">
      <div className="flex flex-col gap-6 rounded-card border border-line bg-surface p-6">
        <h1 className="text-xl font-semibold">로그인</h1>
        <SignInForm onSuccess={onSuccess} />
        {/* [데모 환경] 평가용 데모 계정 안내. 실제 서비스에는 없는 문구 */}
        <p className="text-xs text-ink-faint">
          데모 계정: demo@example.com / password123
        </p>
      </div>
    </section>
  )
}
