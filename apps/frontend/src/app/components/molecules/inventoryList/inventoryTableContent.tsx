'use client'

import { useMemo } from 'react'
import type {
  IProduct,
  InventoryTableContentProps,
} from '@/app/types/inventoryList'
import { Checkbox, Button } from '@/app/components/atoms'
import { StockManageListItem } from '@/app/components/molecules'
import { Trash2 } from 'lucide-react'

export function InventoryTableContent({
  products,
  selectedRows,
  selectAll,
  onSelectRow,
  onSelectAll,
  onBulkDelete,
  onEdit,
  onDelete,
}: InventoryTableContentProps) {
  // ✅ 使用 useMemo 計算選中數量
  const selectedCount = useMemo(() => selectedRows.size, [selectedRows])

  return (
    <div className="w-full">
      <div className="flex items-center h-[72px] p-4 border-b border-border text-center bg-background">
        {onSelectAll && (
          <div className="flex items-center gap-2 px-4">
            <Checkbox
              checked={selectAll ?? false}
              onCheckedChange={(checked) =>
                onSelectAll(checked as boolean | 'indeterminate')
              }
              aria-label="全選當前頁商品"
            />
          </div>
        )}
        <div className="px-4 w-40 text-muted-foreground font-medium text-sm">
          商品名稱
        </div>
        <div className="px-4 flex-1 text-muted-foreground font-medium text-sm">
          分類
        </div>
        <div className="px-4 flex-1 text-muted-foreground font-medium text-sm">
          規格
        </div>
        <div className="px-4 flex-1 text-muted-foreground font-medium text-sm">
          售價
        </div>
        <div className="px-4 flex-1 text-muted-foreground font-medium text-sm">
          庫存
        </div>
        <div className="w-32 ml-auto flex items-center space-x-4 px-6">
          {/* ✅ 只要有選中項目就顯示刪除按鈕（不依賴 selectAll） */}
          {selectedCount > 0 && onBulkDelete && (
            <Button
              onClick={onBulkDelete}
              className="flex items-center gap-1 bg-[#505050] hover:bg-[#404040] transition-colors"
              aria-label={`刪除選中的 ${selectedCount} 個商品`}
            >
              <Trash2 className="w-4 h-4" />
              刪除 ({selectedCount})
            </Button>
          )}
        </div>
      </div>
      <div>
        {products.map((product: IProduct) => (
          <StockManageListItem
            className="w-full"
            key={product.id}
            checked={selectedRows.has(product.id)}
            imageUrl={product.image}
            name={product.name}
            category={product.category}
            specifications={product.specifications}
            price={product.price}
            totalStock={product.totalStock}
            onCheck={(checked) => onSelectRow(product.id, checked)}
            onEdit={() => onEdit(product.id)}
            onDelete={() => onDelete(product.id)}
          />
        ))}
      </div>
    </div>
  )
}
