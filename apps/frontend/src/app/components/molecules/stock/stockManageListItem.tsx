import { memo } from 'react'
import { cn } from '@/app/lib/utils'
import { Checkbox, Delete, Edit } from '@/app/components/atoms'
import { SpecificationPopover } from '@/app/components/molecules'
import type { IProductSpec } from '@/app/types/addProduct'
import Image from 'next/image'

interface IStockManageListItemProps {
  checked: boolean
  imageUrl: string
  name: string
  category: string
  specifications: IProductSpec[]
  price: string | number
  totalStock: number
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

export const StockManageListItem = memo(function StockManageListItem({
  checked,
  imageUrl,
  name,
  category,
  specifications,
  price,
  totalStock,
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
      <div className="flex-1 px-4">
        <SpecificationPopover
          specifications={specifications}
          totalStock={totalStock}
        />
      </div>
      <div className="flex-1 px-4">{price}</div>
      <div className="flex-1 px-4">
        {totalStock === 0 ? '缺貨' : `${totalStock} 件`}
      </div>
      <div className="w-32 ml-auto flex items-center space-x-4 px-6">
        <Edit onClick={onEdit} />
        <Delete onClick={onDelete} />
      </div>
    </div>
  )
})
