import { SidebarMenuButton, SidebarMenuItem } from '@/app/components/atoms'
import Link from 'next/link'
import { INormalMenuItemComponentProps } from '@/app/types/sidebar'

export function NormalMenuItem({
  item,
  path,
  open: sidebarOpen,
}: INormalMenuItemComponentProps) {
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
