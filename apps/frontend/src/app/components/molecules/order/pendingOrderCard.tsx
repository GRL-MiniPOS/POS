import { cn } from '@/app/lib/utils'

interface IProduct {
  name: string
  price: number
  status?: string // 例如 "無庫存"、"斷貨"
}

interface IPendingOrderCardProps {
  orderId: number
  customer: string
  products: IProduct[]
  total: number
  className?: string
  onEdit?: () => void
}

export function PendingOrderCard({
  orderId,
  customer,
  products,
  total,
  className,
  onEdit,
}: IPendingOrderCardProps) {
  return (
    <div
      className={cn(
        'p-6 w-80 border border-[#505050] rounded-xl shadow-sm flex flex-col',
        className
      )}
    >
      <div className="font-bold mb-2">
        訂單編號 <span className="font-black">#{orderId}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>顧客</span>
        <span>{customer}</span>
      </div>
      <div className="mb-2">
        {products.map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            className={
              p.status
                ? 'text-red-500 flex justify-between'
                : 'flex justify-between'
            }
          >
            <span>
              {p.name}
              {p.status && <span className="text-xs ml-1">（{p.status}）</span>}
            </span>
            <span>${p.price}</span>
          </div>
        ))}
      </div>
      <hr className="my-2" />
      <div className="flex justify-between font-bold text-lg mb-4">
        <span>總價</span>
        <span>${total}</span>
      </div>
      <button
        className="bg-[#A4917F] text-white py-2 rounded-xl"
        onClick={onEdit}
      >
        編輯
      </button>
    </div>
  )
}
