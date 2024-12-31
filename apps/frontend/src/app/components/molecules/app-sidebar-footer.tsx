import { LogOut, Settings } from 'lucide-react'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/app/components/atoms'
import Link from 'next/link'

// Footer items
const footerItems = [
  {
    title: 'Settings',
    url: 'javascript:void(0)',
    icon: Settings,
  },
  {
    title: 'Log out',
    url: '/logout',
    icon: LogOut,
  },
]

export function AppSidebarFooter() {
  const { open } = useSidebar()

  return (
    <SidebarFooter>
      <SidebarMenu>
        {footerItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link href={item.url} className="py-5">
                <item.icon className={`${open ? '!size-5' : ''}`} />
                <span className="text-base">{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarFooter>
  )
}
