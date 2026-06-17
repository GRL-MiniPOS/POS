'use client'

import type { CategoryFilterSectionProps } from '@/app/types/inventoryList'
import { Checkbox, Label } from '@/app/components/atoms'
import { useProductCategoriesQuery } from '@/app/hooks/queries/useProductCategoriesQuery'

export function CategoryFilterSection({
  selected,
  onToggle,
}: CategoryFilterSectionProps) {
  const { data: categories, isPending, isError } = useProductCategoriesQuery()

  return (
    <div className="space-y-3">
      <Label>分類</Label>
      {isPending ? (
        <p className="text-sm text-muted-foreground">載入分類中...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">分類載入失敗</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無分類</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(category.id)}
                onCheckedChange={() => onToggle(category.id)}
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
