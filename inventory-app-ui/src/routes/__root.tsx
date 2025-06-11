import { Outlet, createRootRoute } from '@tanstack/react-router'

import { BackgroundPattern } from '@components/layout/BackgroundPattern'
import { Navbar } from '@components/layout/Navbar'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />

      <main className="min-h-screen bg-background px-4 py-24">
        <BackgroundPattern />

        <div className="relative flex w-full max-w-5xl flex-col items-center justify-center gap-12">
          <Outlet />
        </div>
      </main>

      <TanStackRouterDevtools />
    </>
  ),
})
