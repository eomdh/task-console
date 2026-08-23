import { DashboardStats } from '@/widgets/dashboard-stats'

export function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">대시보드</h1>
      <DashboardStats />
    </section>
  )
}
