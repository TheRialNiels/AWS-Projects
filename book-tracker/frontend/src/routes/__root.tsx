import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import Header from '@/components/layout/Header.tsx'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { AuthProvider } from '@/lib/auth-context'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <AuthProvider>
      <div className="relative">
          <Header />
          <div className="px-4 sm:px-8 xl:px-0 py-10">
            <div className="mx-auto w-full max-w-4xl">
              <Outlet />
            </div>
          </div>
      </div>

      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </AuthProvider>
  ),
})
