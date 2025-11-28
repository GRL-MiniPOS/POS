'use client'

import type { CategoryFilterSectionProps } from '@/app/types/inventoryList'
import { Label, Checkbox } from '@/app/components/atoms'
import { categories } from '@/app/product/inventory-list/mock/data'

export function CategoryFilterSection({
  selected,
  onToggle,
}: CategoryFilterSectionProps) {
  return (
    <div className="space-y-3">
      <Label>分類</Label>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <div
            key={category}
            className="flex items-center space-x-2 rounded-md border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => onToggle(category)}
          >
            <Checkbox
              checked={selected.includes(category)}
              onCheckedChange={() => onToggle(category)}
            />
            <label className="text-sm font-medium cursor-pointer flex-1">
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
