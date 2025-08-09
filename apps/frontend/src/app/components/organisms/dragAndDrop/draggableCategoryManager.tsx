// components/organisms/dragAndDrop/draggableCategoryManager.tsx
import { useState, useEffect } from 'react'
import type { ICategoryStrategy } from '@/app/types/dragAndDrop'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Card } from '@/app/components/atoms'
import { SortableItem, AddCategoryDialog } from '@/app/components/molecules'
import { cn } from '@/app/lib/utils'

interface DraggableCategoryManagerProps {
  strategy: ICategoryStrategy
  className?: string
}

export function DraggableCategoryManager({
  strategy,
  className,
}: DraggableCategoryManagerProps) {
  const [mounted, setMounted] = useState(false)

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

  const items = strategy.getItems()

  return (
    <div className={cn('max-w-md w-full', className)}>
      <Card
        className={cn(
          'h-80 overflow-x-hidden overflow-y-auto shadow-sm rounded-none'
        )}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={strategy.handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableItem
                key={item.id}
                id={item.id}
                name={item.name}
                showArrow={strategy.type === 'main'}
                handleDelete={strategy.handleDelete}
                handleClick={strategy.handleClick}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Card>
      <AddCategoryDialog onAdd={strategy.handleAdd} />
    </div>
  )
}
