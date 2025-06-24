import type { ISortableItemProps } from '@/app/types/dnd'
import type { MouseEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/app/components/atoms'
import { Trash2, ChevronRight } from 'lucide-react'

export function SortableItem({
  id,
  name,
  isActive = false,
  showArrow = true,
  onDelete,
  onClick,
}: ISortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation()
    if (confirm('你確定要刪除該分類嗎?')) {
      onDelete?.(id)
    }
  }

  const handleClick = () => {
    onClick?.(id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 bg-white hover:bg-gray-50 group ${
        isActive ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center flex-1 cursor-grab active:cursor-grabbing"
      >
        <span className="flex-1 truncate text-sm font-medium text-gray-900 select-none">
          {name}
        </span>
        {showArrow && <ChevronRight className="h-4 w-4 text-gray-400" />}
      </div>
      {onDelete && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
