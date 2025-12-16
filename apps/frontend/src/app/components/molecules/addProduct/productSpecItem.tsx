import { X } from 'lucide-react'
import { Button, Input, Label } from '@/app/components/atoms'
import { ILocalProductSpec } from '@/app/hooks/useProductSpecForm'

interface ProductSpecItemProps {
  localProductSpec: ILocalProductSpec
  onUpdate: (
    id: string,
    field: keyof Omit<ILocalProductSpec, 'id'>,
    value: string
  ) => void
  onRemove: (id: string) => void
  showRemoveButton: boolean
}

export function ProductSpecItem({
  localProductSpec,
  onUpdate,
  onRemove,
  showRemoveButton,
}: ProductSpecItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
      <div className="flex-1 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label
              htmlFor={`localProductSpec-name-${localProductSpec.id}`}
              className="text-xs text-muted-foreground"
            >
              名稱
            </Label>
            <Input
              id={`localProductSpec-name-${localProductSpec.id}`}
              placeholder="例：白色 M"
              value={localProductSpec.name}
              onChange={(e) =>
                onUpdate(localProductSpec.id, 'name', e.target.value)
              }
              className="h-9"
              required
            />
          </div>
          <div>
            <Label
              htmlFor={`localProductSpec-quantity-${localProductSpec.id}`}
              className="text-xs text-muted-foreground"
            >
              數量
            </Label>
            <Input
              id={`localProductSpec-quantity-${localProductSpec.id}`}
              type="number"
              min="0"
              placeholder="例：100"
              value={localProductSpec.quantity}
              onChange={(e) =>
                onUpdate(localProductSpec.id, 'quantity', e.target.value)
              }
              className="h-9"
              required
            />
          </div>
        </div>
      </div>
      {showRemoveButton && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(localProductSpec.id)}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
