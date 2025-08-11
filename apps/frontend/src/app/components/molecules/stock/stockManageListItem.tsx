import { cn } from '@/app/lib/utils'
import { Checkbox } from '@/app/components/atoms/checkbox'
import { Delete } from '@/app/components/atoms/button/delete'
import { Edit } from '@/app/components/atoms/button/edit'
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
        'flex items-center py-3 rounded-lg hover:bg-accent',
        className
      )}
    >
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
      <div className="px-4">{name}</div>
      <div className="px-4">{category}</div>
      <div className="px-4">{spec}</div>
      <div className="px-4">{`$${price}`}</div>
      <div className="px-4">{stock}</div>
      <div className="flex items-center space-x-2 px-4">
        <Edit onClick={onEdit} />
        <Delete onClick={onDelete} />
      </div>
    </div>
  )
}

export default StockManageListItem
