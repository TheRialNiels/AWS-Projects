'use client'

import { Paperclip, Send } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ChatInput() {
    const editorRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    // TODO - Add file management
    const handleDrop = (event: React.DragEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsDragging(false)

        const files = Array.from(event.dataTransfer.files)
        console.log('Files dropped:', files)
    }

    // TODO - Add logic
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const message = editorRef.current?.innerText.trim()
        if (message) {
            console.log('Sending message:', message)
            editorRef.current!.innerText = ''
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                'flex items-end gap-2 border border-border rounded-lg p-4 bg-background w-full',
                'transition-all',
                isDragging && 'ring-2 ring-primary bg-primary/20',
            )}
            onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-muted-foreground hover:text-foreground h-9 flex items-center"
                    >
                        <Paperclip className="w-5 h-5" />
                    </label>
                </TooltipTrigger>

                <TooltipContent>
                    <p>Attach files (images, documents, etc.)</p>
                    <p>by clicking or dragging them here.</p>
                </TooltipContent>
            </Tooltip>

            <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    console.log('Files selected:', files)
                }}
            />

            <div
                ref={editorRef}
                contentEditable
                role="textbox"
                data-placeholder="Ask anything..."
                className={cn(
                    'flex-1 w-full overflow-y-auto min-h-9 max-h-52',
                    'focus:outline-none p-1 rounded-md',
                    'bg-transparent text-sm',
                    'before:content-[attr(data-placeholder)] before:text-muted-foreground',
                    'before:absolute before:top-1.5 before:left-2 before:pointer-events-none',
                    '[&:not(:empty)]:before:hidden',
                    'relative whitespace-pre-wrap break-words',
                )}
            />

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button type="submit" variant="default" size="icon">
                        <Send className="w-5 h-5" />
                    </Button>
                </TooltipTrigger>

                <TooltipContent>
                    <p>Send message</p>
                </TooltipContent>
            </Tooltip>
        </form>
    )
}
