import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'

import { AppSidebar } from '@/components/app-sidebar'
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
                <div className="flex flex-1 flex-col gap-4 p-4">
                    <div>
                        <h2 className="text-2xl text-center flex flex-col gap-2">
                            <span className="font-extrabold text-4xl">Hi Jonhy!</span>
                            How can I help you today?
                        </h2>
                    </div>

                    <div></div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
