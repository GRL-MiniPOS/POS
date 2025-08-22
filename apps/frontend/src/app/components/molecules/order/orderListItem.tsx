import { cn } from '@/app/lib/utils'
import Image from 'next/image'

interface IOrderListItemProps {
  imageUrl: string
  name: string
  price: number | string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
}

export function OrderListItem({
  imageUrl,
  name,
  price,
  size = 'medium',
  className,
}: IOrderListItemProps) {
  const imgSize = sizeMap[size] ?? sizeMap.medium

  return (
    <div
      className={cn(
        'flex items-center py-2 px-3 hover:bg-accent rounded-lg cursor-pointer',
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={name}
        width={imgSize}
        height={imgSize}
        className="object-cover rounded-md mr-3"
      />
      <span className="flex-1">{name}</span>
      <span className="text-right min-w-[48px]">{`$${price}`}</span>
    </div>
  )
}
