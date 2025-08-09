import {
  ChartColumnBig,
  CircleUserRound,
  Home,
  Package2,
  SquareChartGantt,
  SquareUserRound,
  ChevronRight,
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
import { cn } from '@/app/lib/utils'
import {
  INormalMenuItem,
  ICollapsibleMenuItem,
  IMenuItemComponentProps,
  ISubMenuItem,
  IAppSidebarMenuProps,
} from '@/app/types/sidebar'
import { useState } from 'react'

const menuItems: (INormalMenuItem | ICollapsibleMenuItem)[] = [
  {
    type: 'normal',
    title: '總覽',
    url: '/',
    icon: Home,
  },
  {
    type: 'collapsible',
    title: '商品',
    url: '/product',
    icon: Package2,
    defaultOpen: false,
    subItems: [
      {
        title: '所有商品',
        url: '/product/all-products',
      },
      {
        title: '分類管理',
        url: '/product/category-management',
      },
      {
        title: '庫存列表',
        url: '/product/inventory-list',
      },
    ],
  },
  {
    type: 'collapsible',
    title: '訂單管理',
    url: '/order',
    icon: SquareChartGantt,
    defaultOpen: false,
    subItems: [
      {
        title: '所有訂單',
        url: '/order/all-orders',
      },
      {
        title: '新增訂單',
        url: '/order/create-order',
      },
    ],
  },
  {
    type: 'normal',
    title: '報表',
    url: '/report',
    icon: ChartColumnBig,
  },
  {
    type: 'normal',
    title: '顧客',
    url: '/customer',
    icon: SquareUserRound,
  },
]

function MenuItemComponent({
  item,
  path,
  open: sidebarOpen,
}: IMenuItemComponentProps) {
  const shouldBeExpanded = (): boolean => {
    if (item.type === 'collapsible') {
      return (
        path === item.url ||
        item.subItems.some((subItem) => path === subItem.url)
      )
    }
    return false
  }
  const [isExpanded, setIsExpanded] = useState<boolean>(
    item.type === 'collapsible' ? shouldBeExpanded() || item.defaultOpen : false
  )
  // 可折疊菜單項目
  if (item.type === 'collapsible') {
    return (
      <div>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-5 hover:bg-sidebar-accent cursor-pointer"
          >
            <item.icon />
            <span className="text-base">{item.title}</span>
            <ChevronRight
              className={cn(
                'ml-auto h-4 w-4 transition-transform duration-200',
                isExpanded && 'rotate-90'
              )}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="ml-6 mt-1 space-y-1">
            {item.subItems.map((subItem: ISubMenuItem) => (
              <SidebarMenuItem key={subItem.title}>
                <SidebarMenuButton
                  isActive={path === subItem.url}
                  asChild
                  size="sm"
                >
                  <Link href={subItem.url} className="py-3">
                    <span className="text-sm">{subItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        </div>
      </div>
    )
  }
  // 普通菜單項目
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={path === item.url} asChild>
        <Link href={item.url} className="py-5">
          <item.icon className={`${sidebarOpen ? '!size-5' : ''}`} />
          <span className="text-base">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function AppSidebarMenu({ path }: IAppSidebarMenuProps) {
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
            {menuItems.map(
              (item: INormalMenuItem | ICollapsibleMenuItem, index: number) => (
                <MenuItemComponent
                  key={`${item.title}-${index}`}
                  item={item}
                  path={path}
                  open={open}
                />
              )
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
