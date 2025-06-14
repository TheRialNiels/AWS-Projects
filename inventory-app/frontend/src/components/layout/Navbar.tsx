import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import clsx from 'clsx'

function Links() {
  const links = [
    {
      to: '/categories',
      label: 'Categories',
    },
    {
      to: '/products',
      label: 'Products',
    },
  ]

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className="main-button hover:bg-primary hover:text-primary-foreground"
        >
          {link.label}
        </Link>
      ))}
    </>
  )
}

function Logout({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'default' | 'lg' | 'icon' | null | undefined
  className?: string
}) {
  return (
    <Button
      variant="outline"
      size={size}
      className={clsx(
        className,
        'main-button bg-primary text-primary-foreground hover:bg-primary/90',
      )}
    >
      Logout
    </Button>
  )
}

export function Navbar() {
  return (
    <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-50 w-full border-b px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">Inventory App</span>
        </div>

        <nav className="hidden gap-6 text-sm font-medium md:flex">
          <Links />
        </nav>

        <div className="flex items-center gap-2">
          <Logout className="hidden md:inline-flex" />

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-sidebar w-64 p-4">
                <div className="mt-6 flex flex-col gap-4 text-base font-medium">
                  <Links />
                  <Logout className="mt-4" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
