'use client'

import { X } from 'lucide-react'
import {
  Input,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/atoms'
import type { OrderCartProps } from '@/app/types/createOrder'

export function OrderCart({
  lines,
  total,
  onQuantityChange,
  onRemove,
  payment,
  source,
  onPaymentChange,
  onSourceChange,
  paymentOptions,
  sourceOptions,
  isSubmitting,
  onSubmit,
}: OrderCartProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <h2 className="text-lg font-semibold">訂單明細</h2>

      {lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚未加入商品</p>
      ) : (
        <ul className="space-y-3">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{line.name}</p>
                {line.variantLabel && (
                  <p className="text-xs text-muted-foreground">
                    {line.variantLabel}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  NT$ {line.unitPrice.toLocaleString()}
                </p>
              </div>
              <Input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(event) =>
                  onQuantityChange(line.key, Number(event.target.value))
                }
                className="h-9 w-20"
                aria-label={`${line.name} 數量`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(line.key)}
                className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                aria-label="移除"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">總金額</span>
        <span className="text-lg font-semibold">
          NT$ {total.toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-payment">付款方式（選填）</Label>
        <Select value={payment} onValueChange={onPaymentChange}>
          <SelectTrigger id="order-payment" className="w-full">
            <SelectValue placeholder="選擇付款方式" />
          </SelectTrigger>
          <SelectContent>
            {paymentOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order-source">訂單來源（選填）</Label>
        <Select value={source} onValueChange={onSourceChange}>
          <SelectTrigger id="order-source" className="w-full">
            <SelectValue placeholder="選擇訂單來源" />
          </SelectTrigger>
          <SelectContent>
            {sourceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={lines.length === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? '建立中...' : '建立訂單'}
      </Button>
    </div>
  )
}
