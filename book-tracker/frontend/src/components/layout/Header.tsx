import { BookUserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from '@tanstack/react-router'

export default function Header() {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.navigate({ to: '/login' })
  }

  return (
    <header className="px-4 sticky top-0 left-0 z-50 sm:px-8 xl:px-0 py-6 bg-sidebar border-b border-sidebar-border">
      <div className="mx-auto max-w-4xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookUserIcon className="size-7" />
          <span className="text-lg font-bold tracking-wider">Book Tracker</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
