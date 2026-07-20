import type { DragEndEvent } from '@dnd-kit/core'
import type { IDndItem, ICategoryStrategy } from '@/app/types/dragAndDrop'
import { arrayMove } from '@dnd-kit/sortable'

// onAdd / onDelete 由呼叫端注入並自行處理錯誤（toast），不會 reject；
// strategy 只負責確認流程、找不到資料的防呆與本地拖曳排序。
export interface MainCategoryCallbacks {
  onClick: (id: string) => void
  onAdd: (name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onReorder: (items: IDndItem[]) => void
  onBeforeDelete?: (id: string, name: string) => Promise<boolean>
  onError?: (message: string) => void
}

export class MainCategoryStrategy implements ICategoryStrategy {
  type = 'main' as const

  // 唯讀顯示資料，來源是 React Query 結果（已映射成 IDndItem 並依 order 排序）。
  private items: IDndItem[]
  private callbacks: MainCategoryCallbacks

  constructor(items: IDndItem[], callbacks: MainCategoryCallbacks) {
    this.items = items
    this.callbacks = callbacks
  }

  // 獲取主分類列表
  getItems = () => this.items

  // 新增主分類（頂層，parent_id 由呼叫端帶 null）
  handleAdd = async (name: string) => {
    await this.callbacks.onAdd(name)
  }

  // 點擊主分類
  handleClick = (id: string) => {
    this.callbacks.onClick(id)
  }

  // 刪除主分類
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

  // 拖拽結束：產生重排後的完整清單交給 onReorder，由呼叫端負責持久化。
  handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id === over?.id) return

    const oldIndex = this.items.findIndex((item) => item.id === active.id)
    const newIndex = this.items.findIndex((item) => item.id === over?.id)
    if (oldIndex === -1 || newIndex === -1) return

    this.callbacks.onReorder(arrayMove(this.items, oldIndex, newIndex))
  }
}
