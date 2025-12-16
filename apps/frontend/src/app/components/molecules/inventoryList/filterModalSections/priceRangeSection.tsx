'use client'

import type { PriceRangeSectionProps } from '@/app/types/inventoryList'
import { Label, Input } from '@/app/components/atoms'

export function PriceRangeSection({
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
}: PriceRangeSectionProps) {
  return (
    <div className="space-y-3">
      <Label>售價範圍</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
            最低價格
          </Label>
          <Input
            id="priceMin"
            type="number"
            placeholder="0"
            value={priceMin ?? ''}
            onChange={(e) =>
              onPriceMinChange(e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
            最高價格
          </Label>
          <Input
            id="priceMax"
            type="number"
            placeholder="無上限"
            value={priceMax ?? ''}
            onChange={(e) =>
              onPriceMaxChange(e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>
    </div>
  )
}
