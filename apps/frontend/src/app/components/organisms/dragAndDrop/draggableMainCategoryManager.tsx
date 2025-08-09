import { useState, useEffect } from 'react'
import type { DragEndEvent } from '@dnd-kit/core'
import type { IDndItem } from '@/app/types/dragAndDrop'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from '@/app/components/atoms'
import { SortableItem, AddCategoryDialog } from '@/app/components/molecules'
import { cn } from '@/app/lib/utils'

export function DraggableMainCategoryManager() {
  const [mounted, setMounted] = useState(false)
  const [items, setItems] = useState<IDndItem[]>([
    { id: '1', name: 'Main' },
    { id: '2', name: 'Main' },
    { id: '3', name: 'Main' },
    { id: '4', name: 'Main' },
    { id: '5', name: 'Main' },
  ])

  // 配置拖拽傳感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addNewCategory = (name: string) => {
    const newItem: IDndItem = {
      id: Date.now().toString(),
      name,
    }
    setItems([...items, newItem])
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="max-w-md w-full">
      <Card className={cn('overflow-hidden shadow-sm rounded-none')}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                name={item.name}
                handleDelete={deleteItem}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Card>
      <AddCategoryDialog onAdd={addNewCategory} />
    </div>
  )
}
