import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import Header from '../components/Header'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />

      <div className="px-4 sm:px-8 xl:px-0 py-10">
        <div className="mx-auto w-full max-w-4xl">
          <Outlet />
        </div>
      </div>

      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  ),
})
