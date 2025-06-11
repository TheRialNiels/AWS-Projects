import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-blue-600">
            Inventory App
          </span>
        </div>

        <nav className="hidden gap-6 text-sm font-medium text-gray-700 md:flex">
          <Link to="/categories" className="hover:text-blue-600">
            Categories
          </Link>
          <Link to="/products" className="hover:text-blue-600">
            Products
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:inline-flex">
            Logout
          </Button>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-6 flex flex-col gap-4 text-base font-medium text-gray-700">
                  <Link to="/categories" className="hover:text-blue-600">
                    Categories
                  </Link>
                  <Link to="/products" className="hover:text-blue-600">
                    Products
                  </Link>
                  <Button variant="outline" className="mt-4">
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
