import { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

// 主組件的 Props 類型
export interface IAppSidebarMenuProps {
  path: string // 當前頁面路徑，用於判斷活躍狀態
}

// 子菜單項目類型（不需要 icon）
export interface ISubMenuItem {
  title: string // 子菜單標題
  url: string // 子菜單連結
}

// 普通菜單項目類型
export interface INormalMenuItem {
  type: 'normal'
  title: string
  url: string
  icon: IconType
}

// 可折疊菜單項目類型
export interface ICollapsibleMenuItem {
  type: 'collapsible'
  title: string
  url: string
  icon: IconType
  defaultOpen: boolean
  subItems: ISubMenuItem[]
}

export interface INormalMenuItemComponentProps {
  item: INormalMenuItem
  path: string
  open: boolean
}

export interface ICollapsibleMenuItemComponentProps {
  item: ICollapsibleMenuItem
  path: string
}

export interface IMenuItemComponentProps {
  item: INormalMenuItem | ICollapsibleMenuItem // 直接使用聯合類型
  path: string
  open: boolean
}
