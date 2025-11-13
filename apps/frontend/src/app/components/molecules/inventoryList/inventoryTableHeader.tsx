'use client'

import type {
  IFilterState,
  InventoryTableHeaderProps,
} from '@/app/types/inventoryList'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/app/components/atoms'
import {
  InventoryFilterModal,
  MorphingSearch,
} from '@/app/components/molecules'
import { cn } from '@/app/lib/utils'
import { useState } from 'react'

export function InventoryTableHeader({
  onAddProduct,
  onSearch,
  className,
}: InventoryTableHeaderProps) {
  const initialFilterState: IFilterState = {
    name: '',
    categories: [],
    specifications: [],
    priceMin: null,
    priceMax: null,
    stockStatus: 'all',
    dateFrom: null,
    dateTo: null,
  }

  //商品 filter modal
  const [filters, setFilters] = useState<IFilterState>(initialFilterState) // 篩選條件
  const [isFilterOpen, setIsFilterOpen] = useState(false) // 篩選模態是否開啟

  const resetFilters = () => {
    setFilters(initialFilterState)
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 bg-transparent"
          onClick={() => setIsFilterOpen(true)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
        <MorphingSearch placeholder="搜尋商品..." onSearch={onSearch} />
      </div>

      <Button
        onClick={onAddProduct}
        className="bg-brand hover:bg-brand/90 text-white px-6"
      >
        新增商品
      </Button>
      <InventoryFilterModal
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
    </div>
  )
}
