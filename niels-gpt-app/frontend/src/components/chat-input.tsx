'use client'

import { Paperclip, Send } from 'lucide-react'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'

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
            className={clsx(
                'flex items-end gap-2 border border-border rounded-lg p-4 bg-background w-full',
                'transition-all',
                isDragging && 'ring-2 ring-blue-500',
            )}
            onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
        >
            <label
                htmlFor="file-upload"
                className="cursor-pointer text-muted-foreground hover:text-foreground h-9 flex items-center"
            >
                <Paperclip className="w-5 h-5" />
            </label>
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
                className={clsx(
                    'flex-1 w-full overflow-y-auto min-h-9 max-h-52',
                    'focus:outline-none p-1 rounded-md',
                    'bg-transparent text-sm',
                    'before:content-[attr(data-placeholder)] before:text-muted-foreground',
                    'before:absolute before:top-1.5 before:left-2 before:pointer-events-none',
                    '[&:not(:empty)]:before:hidden',
                    'relative whitespace-pre-wrap break-words',
                )}
            />

            <Button type="submit" variant="default" size="icon">
                <Send className="w-5 h-5" />
            </Button>
        </form>
    )
}
