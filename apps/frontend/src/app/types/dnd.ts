export interface IDndItem {
  id: string
  name: string
}

export interface ISortableItemProps extends IDndItem {
  isActive?: boolean
  showArrow?: boolean
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
  className?: string
}
