import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

import { ChevronRight } from 'lucide-react'
import { NewThreadButton } from '@/components/new-thread-button'

// This is sample data.
const data = {
    navMain: [
        {
            date: 'Tue 22 Jul, 2025',
            url: '#',
            items: [
                {
                    title: 'Greetings chat',
                    url: '#',
                },
                {
                    title: 'What is git?',
                    url: '#',
                },
                {
                    title: 'This is a long thread title',
                    url: '#',
                },
            ],
        },
        {
            date: 'Wed 23 Jul, 2025',
            url: '#',
            items: [
                {
                    title: 'How to create a PR?',
                    url: '#',
                    isActive: true,
                },
                {
                    title: 'File Conventions',
                    url: '#',
                },
                {
                    title: 'How to use the cli?',
                    url: '#',
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar {...props}>
            <SidebarHeader className="px-4 font-sans font-bold text-xl py-[20px]">
                <h2>Threads</h2>
            </SidebarHeader>

            <SidebarContent className="gap-0">
                {data.navMain.map((dateItem) => (
                    <Collapsible
                        key={dateItem.date}
                        defaultOpen
                        className="group/collapsible"
                    >
                        <SidebarGroup className="px-4">
                            <SidebarGroupLabel
                                asChild
                                className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm font-bold"
                            >
                                <CollapsibleTrigger title={dateItem.date}>
                                    {dateItem.date}{' '}
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent className="p-2">
                                    <SidebarMenu>
                                        {dateItem.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <SidebarMenuButton
                                                            asChild
                                                            isActive={
                                                                item.isActive
                                                            }
                                                        >
                                                            <a href={item.url}>
                                                                <span className="truncate">
                                                                    {item.title}
                                                                </span>
                                                            </a>
                                                        </SidebarMenuButton>
                                                    </TooltipTrigger>

                                                    <TooltipContent side='right'>
                                                        <p>{item.title}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                ))}
            </SidebarContent>

            <SidebarRail />

            <SidebarFooter className="px-4">
                <NewThreadButton />
            </SidebarFooter>
        </Sidebar>
    )
}
