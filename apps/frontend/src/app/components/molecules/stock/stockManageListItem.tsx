import { cn } from '@/app/lib/utils'
import { Checkbox, Delete, Edit } from '@/app/components/atoms'
import Image from 'next/image'

interface IStockManageListItemProps {
  checked: boolean
  imageUrl: string
  name: string
  category: string
  spec: string
  price: string | number
  stock: string | number
  size?: 'small' | 'medium' | 'large'
  className?: string
  onCheck: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
}

export function StockManageListItem({
  checked,
  imageUrl,
  name,
  category,
  spec,
  price,
  stock,
  size = 'medium',
  className,
  onCheck,
  onEdit,
  onDelete,
}: IStockManageListItemProps) {
  const imgSize = sizeMap[size] ?? sizeMap.medium

  return (
    <div
      className={cn(
        'flex items-center px-4 py-4 text-center hover:bg-accent',
        className
      )}
    >
      <div className="w-52 shrink-0 flex items-center">
        <div className="px-4">
          <Checkbox checked={checked} onCheckedChange={onCheck} />
        </div>
        <div
          className="flex items-center justify-center"
          style={{ width: imgSize, height: imgSize }}
        >
          <Image
            src={imageUrl}
            alt={name}
            width={imgSize}
            height={imgSize}
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 px-4">{name}</div>
      </div>
      <div className="flex-1 px-4">{category}</div>
      <div className="flex-1 px-4">{spec}</div>
      <div className="flex-1 px-4">{price}</div>
      <div className="flex-1 px-4">{stock}</div>
      <div className="w-32 ml-auto flex items-center space-x-4 px-6">
        <Edit onClick={onEdit} />
        <Delete onClick={onDelete} />
      </div>
    </div>
  )
}

export default StockManageListItem
