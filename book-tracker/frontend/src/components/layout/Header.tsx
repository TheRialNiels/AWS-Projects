import { BookUserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="px-4 sticky top-0 left-0 z-50 sm:px-8 xl:px-0 py-6 bg-sidebar border-b border-sidebar-border">
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookUserIcon className="size-7" />
          <span className="text-lg font-bold tracking-wider">Book Tracker</span>
        </div>

        <Button variant="ghost" size="sm">
          Logout
        </Button>
      </div>
    </header>
  )
}
