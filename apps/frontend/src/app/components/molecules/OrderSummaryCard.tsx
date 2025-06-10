import { cn } from '@/app/lib/utils'

interface IOrderSummaryCardProps {
  title: string
  amount: number
  count: number
  className?: string
}

export function OrderSummaryCard({
  title,
  amount,
  count,
  className,
}: IOrderSummaryCardProps) {
  return (
    <div
      className={cn(
        'w-32 p-3 border border-[#505050] rounded-lg select-none',
        className
      )}
    >
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm text-gray-600">
        NT${amount}/{count}筆
      </div>
    </div>
  )
}
