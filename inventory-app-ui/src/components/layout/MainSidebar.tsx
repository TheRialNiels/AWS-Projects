import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from 'flowbite-react'

import { BiSolidCategoryAlt } from 'react-icons/bi'
import { HiShoppingBag } from 'react-icons/hi'

export function MainSidebar() {
  return (
    <Sidebar
      as="aside"
      className="border-primary-200 bg-primary dark:border-primary-dark-700 dark:bg-primary-dark-800 fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full border-r pt-15 transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem href="#" icon={HiShoppingBag}>
            Products
          </SidebarItem>
          <SidebarItem href="#" icon={BiSolidCategoryAlt}>
            Categories
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  )
}
