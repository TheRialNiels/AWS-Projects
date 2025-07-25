import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'

import { AppSidebar } from '@/components/app-sidebar'
import { ChatInput } from '@/components/chat-input'
import { NewThreadButton } from '@/components/new-thread-button'
import { Separator } from '@/components/ui/separator'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: App,
})

function App() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <h1 className="font-sans font-bold text-2xl">Niels GPT</h1>
                </header>

                <div className="h-full p-4 flex flex-col w-full items-center">
                    <div className="w-full max-w-6xl flex flex-col justify-between h-full">
                        <div>
                            <h2 className="text-2xl text-center">
                                <span className="font-extrabold text-4xl block font-sans mb-2">
                                    Hi Jonhy!
                                </span>
                                How can I help you today?
                            </h2>
                        </div>

                        <div className="flex items-end gap-4">
                            <NewThreadButton />

                            <ChatInput />
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
