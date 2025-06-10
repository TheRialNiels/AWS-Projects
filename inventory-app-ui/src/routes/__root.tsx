import { Outlet, createRootRoute } from '@tanstack/react-router'

import { MainNavbar } from '../components/layout/MainNavbar'
import { MainSidebar } from '../components/layout/MainSidebar'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <MainNavbar />

      <MainSidebar />

      <main className="flex min-h-screen flex-col items-center justify-start bg-primary-100 py-15 sm:ml-64 dark:bg-primary-dark-900">
        {/* Background pattern */}
        <div className="absolute inset-0 size-full">
          <div className="relative h-full w-full select-none">
            <img
              className="absolute right-0 min-h-dvh min-w-dvh dark:hidden"
              alt="Pattern Light"
              src="/pattern-light.svg"
            />
            <img
              className="absolute right-0 hidden min-h-dvh min-w-dvh dark:block"
              alt="Pattern Dark"
              src="/pattern-dark.svg"
            />
          </div>
        </div>

        {/* Router content */}
        <div className="w-full px-3 py-4 dark:text-primary">
          <Outlet />
        </div>

        <TanStackRouterDevtools position="bottom-right" />
      </main>
    </>
  )
}
