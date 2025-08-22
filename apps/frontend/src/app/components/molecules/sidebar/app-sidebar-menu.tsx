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
  useSidebar,
} from '@/app/components/atoms'
import { MenuItemComponent } from '@/app/components/molecules/sidebar/app-sidebar-menuItem'
import {
  INormalMenuItem,
  ICollapsibleMenuItem,
  IAppSidebarMenuProps,
} from '@/app/types/sidebar'

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
                  key={`${item.title}-${index}-${path}`}
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
