import type { DragEndEvent } from '@dnd-kit/core'
import type { IDndItem, ICategoryStrategy } from '@/app/types/dragAndDrop'
import { arrayMove } from '@dnd-kit/sortable'

// onAdd / onDelete 由呼叫端注入並自行處理錯誤（toast），不會 reject；
// onAdd 會用建構時的 parentId 建立子分類，strategy 本身不需要知道 parent。
export interface SubCategoryCallbacks {
  onClick: (id: string) => void
  onAdd: (name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (items: IDndItem[]) => void
  onBeforeDelete?: (id: string, name: string) => Promise<boolean>
  onError?: (message: string) => void
}

export class SubCategoryStrategy implements ICategoryStrategy {
  type = 'sub' as const

  // 唯讀顯示資料，來源是 React Query 結果（已映射成 IDndItem 並依 order 排序）。
  private items: IDndItem[]
  private callbacks: SubCategoryCallbacks

  constructor(items: IDndItem[], callbacks: SubCategoryCallbacks) {
    this.items = items
    this.callbacks = callbacks
  }

  // 獲取子分類列表
  getItems = () => this.items

  // 新增子分類（parent_id 由呼叫端帶當前主分類 id）
  handleAdd = async (name: string) => {
    await this.callbacks.onAdd(name)
  }

  // 點擊子分類
  handleClick = (id: string) => {
    this.callbacks.onClick(id)
  }

  // 刪除子分類
  handleDelete = async (id: string) => {
    const category = this.items.find((item) => item.id === id)
    if (!category) {
      this.callbacks.onError?.('找不到該分類，無法刪除')
      return
    }

    if (this.callbacks.onBeforeDelete) {
      const confirmed = await this.callbacks.onBeforeDelete(id, category.name)
      if (!confirmed) return
    }

    await this.callbacks.onDelete(id)
  }

  // 拖拽結束：無排序 API，僅更新本地顯示順序（非持久化）。
  handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id === over?.id) return

    const oldIndex = this.items.findIndex((item) => item.id === active.id)
    const newIndex = this.items.findIndex((item) => item.id === over?.id)
    if (oldIndex === -1 || newIndex === -1) return

    this.callbacks.onReorder(arrayMove(this.items, oldIndex, newIndex))
  }
}
