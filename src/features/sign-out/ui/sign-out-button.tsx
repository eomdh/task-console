import { LogOut } from 'lucide-react'
import { Button } from '@/shared/ui'
import { useSignOut } from '../model/use-sign-out'

interface SignOutButtonProps {
  // 어디로 보낼지는 조합하는 쪽이 정하므로 feature는 완료만 알린다
  onSignedOut: () => void
}

export function SignOutButton({ onSignedOut }: SignOutButtonProps) {
  const signOut = useSignOut()

  return (
    <Button
      variant="ghost"
      onClick={() => {
        signOut()
        onSignedOut()
      }}
    >
      <LogOut size={16} aria-hidden />
      로그아웃
    </Button>
  )
}
