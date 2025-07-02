import './styles.css'
import './lib/amplify'

import * as TanStackQueryProvider from '@/integrations/tanstack-query/root-provider.tsx'

import { RouterProvider, createRouter } from '@tanstack/react-router'

import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { Slide, ToastContainer, type ToastContainerProps } from 'react-toastify'
import reportWebVitals from '@/reportWebVitals.ts'
// Import the generated route tree
import { routeTree } from '@/routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  const toastConfig: ToastContainerProps = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    newestOnTop: true,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: 'dark',
    transition: Slide,
    toastClassName: 'bg-background! text-foreground!',
  }

  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider>
        <RouterProvider router={router} />
        <ToastContainer {...toastConfig} />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
