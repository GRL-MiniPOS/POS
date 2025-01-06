import {
  ChartColumnBig,
  CircleUserRound,
  Home,
  Package2,
  SquareChartGantt,
  SquareUserRound,
} from 'lucide-react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/app/components/atoms'
import Link from 'next/link'

interface AppSidebarMenuProps {
  path: string // 外部傳入的路徑
}

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

export function AppSidebarMenu({ path }: AppSidebarMenuProps) {
  const { open } = useSidebar()

  return (
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
                <SidebarMenuButton isActive={path === item.url} asChild>
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
  )
}
