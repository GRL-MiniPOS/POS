'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
} from '@/app/components/atoms'
import type { VariantSelectDialogProps } from '@/app/types/createOrder'

export function VariantSelectDialog({
  product,
  open,
  onOpenChange,
  onConfirm,
}: VariantSelectDialogProps) {
  // 只允許選上架的變體（下架變體後端會擋下單）。
  const sellableVariants =
    product?.variants.filter((variant) => variant.sale_status === 'active') ??
    []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-lg">選擇規格</DialogTitle>
          <DialogDescription>
            {product ? `為「${product.name}」選擇要加入的規格` : ''}
          </DialogDescription>
        </DialogHeader>

        {sellableVariants.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            此商品目前無可販售規格
          </p>
        ) : (
          <div className="space-y-2">
            {sellableVariants.map((variant) => {
              const label = Object.values(variant.option_values).join(' / ')
              return (
                <Button
                  key={variant.id}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (product) onConfirm(product, variant)
                  }}
                  className="flex h-auto w-full items-center justify-between bg-transparent px-4 py-3"
                >
                  <span>{label}</span>
                  <span className="text-xs text-muted-foreground">
                    {variant.stock_status === 'out-of-stock'
                      ? '可預購'
                      : '有庫存'}
                  </span>
                </Button>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
