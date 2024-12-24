'use client'

import { Sidebar } from '@/app/components/atoms/sidebar'
import { AppSidebarMenu } from '@/app/components/molecules/app-sidebar-menu'
import { usePathname } from 'next/navigation'
import { AppSidebarFooter } from '@/app/components/molecules/app-sidebar-footer'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <AppSidebarMenu path={pathname} />
      <AppSidebarFooter />
    </Sidebar>
  )
}
