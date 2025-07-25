import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'

import { ChevronRight } from 'lucide-react'

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
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={item.isActive}
                                                    title={item.title}
                                                >
                                                    <a href={item.url}>
                                                        <span className="truncate">
                                                            {item.title}
                                                        </span>
                                                    </a>
                                                </SidebarMenuButton>
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
        </Sidebar>
    )
}
