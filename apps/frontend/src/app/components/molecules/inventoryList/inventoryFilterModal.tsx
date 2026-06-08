'use client'

import { useState, useEffect } from 'react'
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
  ScrollArea,
} from '@/app/components/atoms'
import { RotateCcw } from 'lucide-react'
import {
  CategoryFilterSection,
  SpecificationFilterSection,
  PriceRangeSection,
  StockStatusSection,
  SaleStatusSection,
} from './filterModalSections'

// Empty filter state for reset
const emptyFilters: IFilterState = {
  categories: [],
  specifications: [],
  priceMin: null,
  priceMax: null,
  stockStatus: 'all',
  saleStatus: 'all',
}

export function InventoryFilterModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: InventoryFilterModalProps) {
  // Temporary state for modal
  const [tempFilters, setTempFilters] = useState<IFilterState>(filters)

  // Sync tempFilters when modal opens
  useEffect(() => {
    if (open) {
      setTempFilters(filters)
    }
  }, [open, filters])

  // Toggle category selection (by id)
  const toggleCategory = (id: string) => {
    setTempFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }))
  }

  // Toggle specification selection (by value)
  const toggleSpecification = (value: string) => {
    setTempFilters((prev) => ({
      ...prev,
      specifications: prev.specifications.includes(value)
        ? prev.specifications.filter((s) => s !== value)
        : [...prev.specifications, value],
    }))
  }

  // Apply button: commit tempFilters to parent
  const handleApply = () => {
    onFiltersChange(tempFilters)
    onOpenChange(false)
  }

  // Reset button: only reset tempFilters
  const handleReset = () => {
    setTempFilters(emptyFilters)
  }

  // Cancel/Close: restore tempFilters to original filters
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTempFilters(filters) // Restore original state
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">篩選商品</DialogTitle>
          <DialogDescription>選擇篩選條件以找到您需要的商品</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(85vh-180px)] pr-4">
          <div className="space-y-6 p-1">
            <CategoryFilterSection
              selected={tempFilters.categories}
              onToggle={toggleCategory}
            />
            <SpecificationFilterSection
              selected={tempFilters.specifications}
              onToggle={toggleSpecification}
            />
            <PriceRangeSection
              priceMin={tempFilters.priceMin}
              priceMax={tempFilters.priceMax}
              onPriceMinChange={(value) =>
                setTempFilters((prev) => ({ ...prev, priceMin: value }))
              }
              onPriceMaxChange={(value) =>
                setTempFilters((prev) => ({ ...prev, priceMax: value }))
              }
            />
            <StockStatusSection
              value={tempFilters.stockStatus}
              onChange={(value) =>
                setTempFilters((prev) => ({ ...prev, stockStatus: value }))
              }
            />
            <SaleStatusSection
              value={tempFilters.saleStatus}
              onChange={(value) =>
                setTempFilters((prev) => ({ ...prev, saleStatus: value }))
              }
            />
          </div>
        </ScrollArea>
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            重設
          </Button>
          <Button onClick={handleApply} className="flex-1">
            套用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
