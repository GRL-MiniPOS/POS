'use client'

import type { StockStatusSectionProps } from '@/app/types/inventoryList'
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/atoms'

export function StockStatusSection({
  value,
  onChange,
}: StockStatusSectionProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="stockStatus">庫存狀態</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as StockStatusSectionProps['value'])}
      >
        <SelectTrigger id="stockStatus">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="in-stock">有貨</SelectItem>
          <SelectItem value="out-of-stock">斷貨</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
