import { Outlet } from '@tanstack/react-router'
import { Gnb } from '@/widgets/gnb'

export function RootLayout() {
  return (
    <>
      <Gnb />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </>
  )
}
