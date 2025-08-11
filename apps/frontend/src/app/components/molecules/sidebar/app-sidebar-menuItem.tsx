import { ChevronRight } from 'lucide-react'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/atoms'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'
import { IMenuItemComponentProps, ISubMenuItem } from '@/app/types/sidebar'
import { useState } from 'react'

export function MenuItemComponent({
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
    if (!sidebarOpen) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="py-5 hover:bg-sidebar-accent cursor-pointer"
                isActive={
                  path === item.url ||
                  item.subItems.some((subItem) => path === subItem.url)
                }
              >
                <item.icon />
                <span className="text-base">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="start"
            className="w-48 p-2"
            sideOffset={16}
          >
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b">
                {item.title}
              </div>
              {item.subItems.map((subItem: ISubMenuItem) => (
                <Link
                  key={subItem.title}
                  href={subItem.url}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-md transition-colors',
                    path === subItem.url
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )
    }

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
