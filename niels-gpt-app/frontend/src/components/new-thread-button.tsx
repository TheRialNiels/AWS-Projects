import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'

export function NewThreadButton() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button size='icon' className='mb-4'>
                    <MessageSquarePlus className="size-5" />
                </Button>
            </TooltipTrigger>

            <TooltipContent>
                <p>New thread</p>
            </TooltipContent>
        </Tooltip>
    )
}
