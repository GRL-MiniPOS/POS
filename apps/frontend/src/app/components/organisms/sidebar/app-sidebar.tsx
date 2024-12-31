'use client'

import { Sidebar } from '@/app/components/atoms'
import { AppSidebarMenu, AppSidebarFooter } from '@/app/components/molecules'
import { usePathname } from 'next/navigation'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <AppSidebarMenu path={pathname} />
      <AppSidebarFooter />
    </Sidebar>
  )
}
