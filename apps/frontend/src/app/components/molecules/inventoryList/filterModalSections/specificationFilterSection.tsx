'use client'

import type { SpecificationFilterSectionProps } from '@/app/types/inventoryList'
import { Checkbox, Label } from '@/app/components/atoms'
import { useProductOptionsQuery } from '@/app/hooks/queries/useProductOptionsQuery'

export function SpecificationFilterSection({
  selected,
  onToggle,
}: SpecificationFilterSectionProps) {
  const { data: optionGroups, isPending, isError } = useProductOptionsQuery()

  return (
    <div className="space-y-3">
      <Label>規格</Label>
      {isPending ? (
        <p className="text-sm text-muted-foreground">載入規格中...</p>
      ) : isError ? (
        <p className="text-sm text-destructive">規格載入失敗</p>
      ) : optionGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">尚無規格</p>
      ) : (
        <div className="space-y-3">
          {optionGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="text-sm text-muted-foreground">{group.name}</p>
              <div className="flex flex-wrap gap-3">
                {group.values.map((value) => (
                  <label
                    key={`${group.id}-${value}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selected.includes(value)}
                      onCheckedChange={() => onToggle(value)}
                    />
                    <span className="text-sm">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
