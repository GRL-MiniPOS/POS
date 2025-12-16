import { AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/app/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@/app/components/atoms'
import type { IProductSpec } from '@/app/types/addProduct'

interface SpecificationPopoverProps {
  specifications: IProductSpec[]
  totalStock: number
  trigger?: React.ReactNode
  maxHeight?: string
  className?: string
}

export function SpecificationPopover({
  specifications,
  totalStock,
  trigger,
  maxHeight = '300px',
  className,
}: SpecificationPopoverProps) {
  // 默認觸發器：顯示規格數量統計
  const defaultTrigger = (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 text-sm hover:text-primary transition-colors',
        className
      )}
      aria-label="查看規格明細"
    >
      <span>
        {specifications.length === 0
          ? '無規格'
          : `${specifications.length} 個規格`}
      </span>
      <ChevronDown className="w-3 h-3" />
    </button>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-md" align="start">
        {/* Header: 總庫存 */}
        <div className="px-4 py-3 bg-muted/50 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">總庫存</span>
            <span
              className={cn(
                'text-sm font-semibold',
                totalStock === 0 ? 'text-destructive' : 'text-foreground'
              )}
            >
              {totalStock === 0 ? '缺貨' : `${totalStock} 件`}
            </span>
          </div>
        </div>

        {/* Body: 規格列表 */}
        {specifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            無規格資料
          </div>
        ) : (
          <ScrollArea style={{ maxHeight }} className="overflow-y-auto">
            <div className="divide-y">
              {specifications.map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  {/* 規格名稱 */}
                  <span
                    className="text-sm truncate max-w-[180px]"
                    title={spec.name}
                  >
                    {spec.name}
                  </span>

                  {/* 數量 */}
                  {spec.quantity === 0 ? (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-sm font-medium">缺貨</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium">
                      {spec.quantity} 件
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
