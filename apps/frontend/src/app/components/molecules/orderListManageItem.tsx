import { cn } from '@/app/lib/utils'
import { Checkbox } from '@/app/components/atoms/checkbox'
import { Edit } from '@/app/components/atoms/button/edit'
import Image from 'next/image'

interface IOrderListManageItemProps {
  checked: boolean
  imageUrl: string
  orderId: string | number
  date: string
  source: string
  paymentStatus: string
  paymentMethod: string
  shippingStatus: string
  customerName: string
  note?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
  onCheck: (checked: boolean) => void
  onEdit: () => void
}

const sizeMap = {
  small: 40,
  medium: 60,
  large: 80,
}

export function OrderListManageItem({
  checked,
  imageUrl,
  orderId,
  date,
  source,
  paymentStatus,
  paymentMethod,
  shippingStatus,
  customerName,
  note,
  size = 'medium',
  className,
  onCheck,
  onEdit,
}: IOrderListManageItemProps) {
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
          alt={customerName}
          width={imgSize}
          height={imgSize}
          className="object-cover rounded-lg"
        />
      </div>
      <div className="px-4">{orderId}</div>
      <div className="px-4">{date}</div>
      <div className="px-4">{source}</div>
      <div className="px-4">{paymentStatus}</div>
      <div className="px-4">{paymentMethod}</div>
      <div className="px-4">{shippingStatus}</div>
      <div className="px-4">{customerName}</div>
      <div className="px-4">{note}</div>
      <div className="flex items-center space-x-2 px-4">
        <Edit onClick={onEdit} />
      </div>
    </div>
  )
}

export default OrderListManageItem
