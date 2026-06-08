'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Input, Button } from '@/app/components/atoms'
import type { ProductPickerProps } from '@/app/types/createOrder'
import type { Product } from '@/app/lib/schemas/products.schema'
import { VariantSelectDialog } from './variantSelectDialog'

export function ProductPicker({
  products,
  isLoading,
  isError,
  search,
  onSearch,
  currentPage,
  totalPages,
  onPageChange,
  onAdd,
}: ProductPickerProps) {
  // 有變體商品點「加入」先開規格選擇框；自身管理選取的商品。
  const [variantProduct, setVariantProduct] = useState<Product | null>(null)

  const handleAddClick = (product: Product) => {
    if (product.has_variants) {
      setVariantProduct(product)
      return
    }
    onAdd(product)
  }

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="搜尋商品名稱"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />

      <div className="rounded-lg border border-border">
        {isError ? (
          <p className="p-6 text-sm text-destructive">
            商品載入失敗，請稍後再試
          </p>
        ) : isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">載入商品中...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">查無商品</p>
        ) : (
          <ul className="divide-y divide-border">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="h-12 w-12 shrink-0">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-md bg-muted"
                      aria-label={`${product.name} 無圖片`}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    NT$ {product.price.toLocaleString()}
                    {product.has_variants ? '・多規格' : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddClick(product)}
                  className="shrink-0 gap-1 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                  加入
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-transparent"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一頁
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="bg-transparent"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一頁
          </Button>
        </div>
      )}

      <VariantSelectDialog
        product={variantProduct}
        open={variantProduct !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setVariantProduct(null)
        }}
        onConfirm={(product, variant) => {
          onAdd(product, variant)
          setVariantProduct(null)
        }}
      />
    </div>
  )
}
