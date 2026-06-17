'use client'

import { Checkbox, Input, Label } from '@/app/components/atoms'
import type { IVariantDraft } from '@/app/types/addProduct'

interface VariantMatrixProps {
  variants: IVariantDraft[]
  onVariantQuantityChange: (key: string, quantity: string) => void
  onVariantSaleStatusToggle: (key: string) => void
}

export function VariantMatrix({
  variants,
  onVariantQuantityChange,
  onVariantSaleStatusToggle,
}: VariantMatrixProps) {
  if (variants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        請為每個規格類型至少新增一個選項值，以產生規格組合。
      </p>
    )
  }

  // 變體的 optionValues 依規格類型順序建立，欄位直接取自第一筆。
  const columnNames = Object.keys(variants[0].optionValues)

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {columnNames.map((columnName) => (
              <th key={columnName} className="px-3 py-2 text-left font-medium">
                {columnName}
              </th>
            ))}
            <th className="w-32 px-3 py-2 text-left font-medium">數量</th>
            <th className="w-20 px-3 py-2 text-left font-medium">上架</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr
              key={variant.key}
              className="border-b border-border last:border-0"
            >
              {columnNames.map((columnName) => (
                <td key={columnName} className="px-3 py-2">
                  {variant.optionValues[columnName]}
                </td>
              ))}
              <td className="px-3 py-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="例：100"
                  value={variant.quantity}
                  onChange={(event) =>
                    onVariantQuantityChange(variant.key, event.target.value)
                  }
                  className="h-9"
                />
              </td>
              <td className="px-3 py-2">
                <Label className="flex cursor-pointer items-center">
                  <Checkbox
                    checked={variant.saleStatus === 'active'}
                    onCheckedChange={() =>
                      onVariantSaleStatusToggle(variant.key)
                    }
                  />
                </Label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
