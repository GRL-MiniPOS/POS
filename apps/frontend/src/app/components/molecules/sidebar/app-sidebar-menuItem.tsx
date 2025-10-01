import {
  PopoverMenuItem,
  CollapsibleMenuItem,
  NormalMenuItem,
} from '@/app/components/molecules'
import { IMenuItemComponentProps } from '@/app/types/sidebar'

export function MenuItemComponent({
  item,
  path,
  open: sidebarOpen,
}: IMenuItemComponentProps) {
  // 可折疊菜單項目
  if (item.type === 'collapsible') {
    if (!sidebarOpen) {
      return <PopoverMenuItem item={item} path={path} />
    }
    return <CollapsibleMenuItem item={item} path={path} />
  }
  // 普通菜單項目
  return <NormalMenuItem item={item} path={path} open={sidebarOpen} />
}
