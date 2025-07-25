import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'

export function NewThreadButton() {
    return (
        <Button size="lg" className="my-4">
            <MessageSquarePlus className="size-5" />
            New Thread
        </Button>
    )
}
