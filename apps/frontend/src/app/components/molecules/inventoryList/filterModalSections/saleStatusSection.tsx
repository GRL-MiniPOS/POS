'use client'

import type { SaleStatusSectionProps } from '@/app/types/inventoryList'
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/atoms'

export function SaleStatusSection({ value, onChange }: SaleStatusSectionProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="saleStatus">上下架狀態</Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as SaleStatusSectionProps['value'])}
      >
        <SelectTrigger id="saleStatus">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="active">上架</SelectItem>
          <SelectItem value="inactive">下架</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
