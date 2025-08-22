import type { DragEndEvent } from '@dnd-kit/core'
import type { IDndItem, ICategoryStrategy } from '@/app/types/dragAndDrop'
import { arrayMove } from '@dnd-kit/sortable'

export class MainCategoryStrategy implements ICategoryStrategy {
  type = 'main' as const // 分類斷言

  // 儲存數據
  private items: IDndItem[]
  private setMainCategories: (
    items: IDndItem[] | ((currentItems: IDndItem[]) => IDndItem[])
  ) => void
  private onMainCategoryClick: (id: string) => void

  constructor(
    items: IDndItem[],
    setMainCategories: (
      items: IDndItem[] | ((currentItems: IDndItem[]) => IDndItem[])
    ) => void,
    callback: {
      onClick: (id: string) => void
    }
  ) {
    this.items = items
    this.setMainCategories = setMainCategories
    this.onMainCategoryClick = callback.onClick
  }

  private updateItems = (
    updater: IDndItem[] | ((currentItems: IDndItem[]) => IDndItem[])
  ) => {
    this.setMainCategories(updater)
  }

  // 獲取主分類列表
  getItems = () => this.items

  // 添加主分類
  handleAdd = (name: string) => {
    const newItem: IDndItem = {
      id: Date.now().toString(),
      name,
    }
    this.updateItems([...this.items, newItem])
  }

  // 刪除主分類
  handleDelete = (id: string) => {
    try {
      // 调用API刪除主分類
      console.log(`删除主分類 ${id} 及其所有子分類`)
      this.updateItems(this.items.filter((item) => item.id !== id))
    } catch (error) {
      console.error('删除主分類失敗:', error)
    }
  }

  // 點擊主分類
  handleClick = (id: string) => {
    this.onMainCategoryClick?.(id)
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
