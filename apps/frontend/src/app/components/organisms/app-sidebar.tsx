'use client'

import {
  ChartColumnBig,
  CircleUserRound,
  Home,
  LogOut,
  Package2,
  Settings,
  SquareChartGantt,
  SquareUserRound,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Menu items
const menuItems = [
  {
    title: '總覽',
    url: '/',
    icon: Home,
  },
  {
    title: '商品',
    url: '/product',
    icon: Package2,
  },
  {
    title: '訂單管理',
    url: '/order',
    icon: SquareChartGantt,
  },
  {
    title: '報表',
    url: '/report',
    icon: ChartColumnBig,
  },
  {
    title: '顧客',
    url: '/customer',
    icon: SquareUserRound,
  },
]

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

export function AppSidebar() {
  const pathname = usePathname()
  const { open } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex justify-center pt-8">
          <Avatar className={`${open ? 'w-16 h-16' : ''}`}>
            <AvatarImage src="https://github.com/shadcn.png" alt="使用者頭像" />
            <AvatarFallback>
              <CircleUserRound className="w-full h-full" strokeWidth={1} />
            </AvatarFallback>
          </Avatar>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={pathname === item.url} asChild>
                    <Link href={item.url} className="py-5">
                      <item.icon className={`${open ? '!size-5' : ''}`} />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
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
    </Sidebar>
  )
}
