import { Button, DarkThemeToggle, Navbar, NavbarBrand } from 'flowbite-react'

import { HiOutlineLogout } from 'react-icons/hi'
import { Link } from '@tanstack/react-router'

const btnParams = {
  class:
    'text-primary-500! hover:bg-primary-100 focus:ring-primary-200 dark:text-primary-400! dark:hover:bg-primary-dark-700! dark:focus:ring-primary-dark-700 w-10 cursor-pointer rounded-lg border-none p-2.5 text-sm focus:ring-2 focus:outline-none',
  iconSize: 22.5,
}

export function MainNavbar() {
  return (
    <Navbar
      fluid
      className="bg-primary dark:bg-primary-dark-800 border-primary-200 dark:border-primary-dark-700 fixed top-0 z-50 w-full border-b px-3!"
    >
      <NavbarBrand as="div">
        <Link to="/products" className="self-center px-2 py-1 text-xl font-semibold whitespace-nowrap dark:text-primary">
          Inventory App
        </Link>
      </NavbarBrand>

      <div className="flex gap-2">
        <DarkThemeToggle className={btnParams.class} />

        <Button
          outline
          className={btnParams.class}
        >
          <HiOutlineLogout size={btnParams.iconSize} />
        </Button>

        {/* TODO - Add button to show sidebar in mobile */}
        {/* <Button outline className={btnParams.class}>
          <HiMenuAlt3 size={btnParams.iconSize} />
        </Button> */}
      </div>
    </Navbar>
  )
}
