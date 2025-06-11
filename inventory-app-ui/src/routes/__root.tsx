import { Outlet, createRootRoute } from '@tanstack/react-router'

import Header from '../components/Header'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>

      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
