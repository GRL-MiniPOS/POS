'use client'

import type {
  IFilterState,
  InventoryFilterModalProps,
} from '@/app/types/inventoryList'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from '@/app/components/atoms'
import { RotateCcw } from 'lucide-react'
import {
  categories,
  specifications,
} from '@/app/product/inventory-list/mock/data'

export function InventoryFilterModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onReset,
}: InventoryFilterModalProps) {
  const updateFilter = <K extends keyof IFilterState>(
    key: K,
    value: IFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    updateFilter('categories', newCategories)
  }

  const toggleSpecification = (spec: string) => {
    const newSpecs = filters.specifications.includes(spec)
      ? filters.specifications.filter((s) => s !== spec)
      : [...filters.specifications, spec]
    updateFilter('specifications', newSpecs)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">篩選商品</DialogTitle>
          <DialogDescription>選擇篩選條件以找到您需要的商品</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-180px)] pr-4">
          <div className="space-y-6 p-1">
            <div className="space-y-2">
              <Label htmlFor="name">商品名稱</Label>
              <Input
                id="name"
                placeholder="搜尋商品名稱..."
                value={filters.name}
                onChange={(e) => updateFilter('name', e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>分類</Label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center space-x-2 rounded-md border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    <Checkbox
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label className="text-sm font-medium cursor-pointer flex-1">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>規格</Label>
              <div className="grid grid-cols-3 gap-2">
                {specifications.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center space-x-2 rounded-md border border-border p-2 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => toggleSpecification(spec)}
                  >
                    <Checkbox
                      checked={filters.specifications.includes(spec)}
                      onCheckedChange={() => toggleSpecification(spec)}
                    />
                    <label className="text-xs font-medium cursor-pointer flex-1">
                      {spec}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>售價範圍</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="priceMin"
                    className="text-xs text-muted-foreground"
                  >
                    最低價格
                  </Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="0"
                    value={filters.priceMin ?? ''}
                    onChange={(e) =>
                      updateFilter(
                        'priceMin',
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="priceMax"
                    className="text-xs text-muted-foreground"
                  >
                    最高價格
                  </Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="無上限"
                    value={filters.priceMax ?? ''}
                    onChange={(e) =>
                      updateFilter(
                        'priceMax',
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="stockStatus">庫存狀態</Label>
              <Select
                value={filters.stockStatus}
                onValueChange={(value) =>
                  updateFilter(
                    'stockStatus',
                    value as IFilterState['stockStatus']
                  )
                }
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
          </div>
        </ScrollArea>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重設
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            套用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
