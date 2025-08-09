import type { DragEndEvent } from '@dnd-kit/core'
import type { IDndItem, ICategoryStrategy } from '@/app/types/dragAndDrop'
import { arrayMove } from '@dnd-kit/sortable'

export class SubCategoryStrategy implements ICategoryStrategy {
  type = 'sub' as const // 分類斷言

  // 儲存數據
  private parentId: string
  private items: IDndItem[]
  private setSubCategories: (
    updater: (
      currentItems: Record<string, IDndItem[]>
    ) => Record<string, IDndItem[]>
  ) => void
  private onSubCategoryClick: (id: string) => void

  constructor(
    parentId: string,
    items: IDndItem[],
    setSubCategories: (
      updater: (
        currentItems: Record<string, IDndItem[]>
      ) => Record<string, IDndItem[]>
    ) => void,
    callback: {
      onClick: (id: string) => void
    }
  ) {
    this.parentId = parentId
    this.items = items
    this.setSubCategories = setSubCategories
    this.onSubCategoryClick = callback.onClick
  }

  private updateItems = (
    updater: IDndItem[] | ((currentItems: IDndItem[]) => IDndItem[])
  ) => {
    if (typeof updater === 'function') {
      this.setSubCategories((currentItems) => ({
        ...currentItems,
        [this.parentId]: updater(currentItems[this.parentId] || []),
      }))
    } else {
      this.setSubCategories((currentItems) => ({
        ...currentItems,
        [this.parentId]: updater,
      }))
    }
  }

  // 獲取子分類列表
  getItems = () => this.items

  // 添加子分類
  handleAdd = (name: string) => {
    const newItem: IDndItem = {
      id: `${this.parentId}-${Date.now()}`,
      name,
    }
    this.updateItems([...this.items, newItem])
  }

  // 刪除子分類
  handleDelete = (id: string) => {
    try {
      // 調用API刪除子分類
      this.updateItems(this.items.filter((item) => item.id !== id))
    } catch (error) {
      console.error('删除子分類失敗:', error)
    }
  }

  // 點擊子分類
  handleClick = (id: string) => {
    this.onSubCategoryClick?.(id)
  }

  // 拖拽結束
  handleDragEnd = (event: DragEndEvent) => {
    // active: 被拖拽的項目, over: 拖拽到的位置
    const { active, over } = event
    // 如果位置有變化，則更新列表
    if (active.id !== over?.id) {
      this.updateItems((items: IDndItem[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }
}
