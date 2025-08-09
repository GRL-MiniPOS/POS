import type { DragEndEvent } from '@dnd-kit/core'

// 基礎類型
export interface IDndItem {
  id: string
  name: string
}

// UI组件接口
export interface ISortableItemProps extends IDndItem {
  isActive?: boolean
  showArrow?: boolean
  className?: string
  handleClick?: (id: string) => void
  handleDelete?: (id: string) => void
}

// 策略模式，根據不同的類型執行不同的操作
export interface ICategoryStrategy {
  type: 'main' | 'sub'
  handleAdd: (name: string) => void
  handleClick?: (id: string) => void
  handleDelete?: (id: string) => void
  handleDragEnd: (event: DragEndEvent) => void
  getItems: () => IDndItem[]
}
