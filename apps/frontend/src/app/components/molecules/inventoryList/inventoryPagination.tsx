'use client'

import type { InventoryPaginationProps } from '@/app/types/inventoryList'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/atoms'

export function InventoryPagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onRowsPerPageChange,
}: InventoryPaginationProps) {
  return (
    <div className="flex items-center justify-end gap-8 mt-6">
      <Select
        value={rowsPerPage.toString()}
        onValueChange={(value) => onRowsPerPageChange(Number(value))}
      >
        <SelectTrigger className="w-[130px] h-10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 rows</SelectItem>
          <SelectItem value="10">10 rows</SelectItem>
          <SelectItem value="20">20 rows</SelectItem>
          <SelectItem value="50">50 rows</SelectItem>
        </SelectContent>
      </Select>

      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {startIndex + 1}-{endIndex} of {totalItems}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
