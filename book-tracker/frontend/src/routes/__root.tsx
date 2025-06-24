import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { AuthProvider } from '@/lib/auth-context'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryLayout from '@/integrations/tanstack-query/layout.tsx'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <AuthProvider>
      <Outlet />

      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </AuthProvider>
  ),
})
