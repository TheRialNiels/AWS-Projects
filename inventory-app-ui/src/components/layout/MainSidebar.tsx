import { ElementType, ReactNode } from 'react'
import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from 'flowbite-react'

import { BiSolidCategoryAlt } from 'react-icons/bi'
import { HiShoppingBag } from 'react-icons/hi'
import { Link } from '@tanstack/react-router'

function MainLink({
  to,
  icon,
  children,
}: {
  to: string
  icon: any
  children: ReactNode
}) {
  return (
    <Link to={to}>
      <SidebarItem as="span" icon={icon}>
        {children}
      </SidebarItem>
    </Link>
  )
}

export function MainSidebar() {
  const links: { to: string; icon: ElementType; label: string }[] = [
    { to: '/products', icon: HiShoppingBag, label: 'Products' },
    { to: '/categories', icon: BiSolidCategoryAlt, label: 'Categories' },
  ]

  return (
    <Sidebar
      as="aside"
      className="border-primary-400 bg-primary-200 dark:border-primary-dark-700 dark:bg-primary-dark-800 fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full border-r pt-15 transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <SidebarItems>
        <SidebarItemGroup className="flex flex-col gap-2">
          {links.map((link) => (
            <MainLink key={link.to} to={link.to} icon={link.icon}>
              {link.label}
            </MainLink>
          ))}
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  )
}
