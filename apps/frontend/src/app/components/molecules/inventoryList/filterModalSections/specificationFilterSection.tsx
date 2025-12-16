'use client'

import type { SpecificationFilterSectionProps } from '@/app/types/inventoryList'
import { Label, Checkbox } from '@/app/components/atoms'
import { specifications } from '@/app/product/inventory-list/mock/data'

export function SpecificationFilterSection({
  selected,
  onToggle,
}: SpecificationFilterSectionProps) {
  return (
    <div className="space-y-3">
      <Label>規格</Label>
      <div className="grid grid-cols-3 gap-2">
        {specifications.map((spec) => (
          <div
            key={spec}
            className="flex items-center space-x-2 rounded-md border border-border p-2 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onToggle(spec)}
          >
            <Checkbox
              checked={selected.includes(spec)}
              onCheckedChange={() => onToggle(spec)}
            />
            <label className="text-xs font-medium cursor-pointer flex-1">
              {spec}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
