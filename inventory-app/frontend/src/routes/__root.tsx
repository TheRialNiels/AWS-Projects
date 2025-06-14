import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Navbar } from '@components/layout/Navbar'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar />

      <main className="bg-background min-h-screen px-4 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-start">
          <Outlet />
        </div>
      </main>

      <TanStackRouterDevtools />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  ),
})
