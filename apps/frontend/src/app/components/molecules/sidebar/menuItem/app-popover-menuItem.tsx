import {
  SidebarMenuButton,
  SidebarMenuItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/atoms'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'
import {
  ICollapsibleMenuItemComponentProps,
  ISubMenuItem,
} from '@/app/types/sidebar'

export function PopoverMenuItem({
  item,
  path,
}: ICollapsibleMenuItemComponentProps) {
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
