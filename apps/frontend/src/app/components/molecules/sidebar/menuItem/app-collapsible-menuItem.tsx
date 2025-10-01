import { ChevronRight } from 'lucide-react'
import { SidebarMenuButton, SidebarMenuItem } from '@/app/components/atoms'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'
import {
  ICollapsibleMenuItemComponentProps,
  ISubMenuItem,
} from '@/app/types/sidebar'
import { useState, useCallback, useMemo } from 'react'

export function CollapsibleMenuItem({
  item,
  path,
}: ICollapsibleMenuItemComponentProps) {
  const shouldBeExpanded = useMemo(() => {
    if (item.type === 'collapsible') {
      return (
        path === item.url ||
        item.subItems.some((subItem) => path === subItem.url)
      )
    }
    return false
  }, [path, item])

  const [isExpanded, setIsExpanded] = useState<boolean>(
    item.type === 'collapsible' ? shouldBeExpanded || item.defaultOpen : false
  )

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  // 可折疊菜單項目
  return (
    <div>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={handleToggleExpanded}
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
