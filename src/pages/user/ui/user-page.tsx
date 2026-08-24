import { UserProfile } from '@/widgets/user-profile'

export function UserPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">회원정보</h1>
      <UserProfile />
    </section>
  )
}
