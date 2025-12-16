import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  useInventorySearch,
  useInventoryPagination,
  useInventorySelection,
  useInventoryFilter,
} from '@/app/hooks'
import { IInventoryItem, IFilterState } from '@/app/types/inventoryList'
import { mockProducts as mockInventoryItems } from '@/app/product/inventory-list/mock/data'
import { convertToProduct } from '@/app/lib/inventoryUtils'
import { useInventoryDelete } from './useInventoryDelete'
import { useInventoryEdit } from './useInventoryEdit'

const initialFilterState: IFilterState = {
  categories: [],
  specifications: [],
  priceMin: null,
  priceMax: null,
  stockStatus: 'all',
  dateFrom: null,
  dateTo: null,
}

export function useInventoryList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<IFilterState>(initialFilterState)

  // 保存原始的 IInventoryItem 資料（用於編輯）
  const [inventoryItems, setInventoryItems] =
    useState<IInventoryItem[]>(mockInventoryItems)

  // 資料處理流程：filter → convert → search → paginate → select
  const filteredByCondition = useInventoryFilter(inventoryItems, filters)

  const allProducts = useMemo(
    () => filteredByCondition.map(convertToProduct),
    [filteredByCondition]
  )

  const filteredProducts = useInventorySearch(allProducts, searchQuery)
  const pagination = useInventoryPagination(filteredProducts, 5)
  const selection = useInventorySelection(
    pagination.currentItems,
    filteredProducts,
    searchQuery
  )

  const { setCurrentPage } = pagination

  // 副作用：搜尋改變時重置分頁
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, setCurrentPage])

  // Sub-hooks for Delete and Edit logic
  const {
    deleteDialog,
    handleDelete,
    handleBulkDelete,
    handleConfirmDelete,
    handleCloseDeleteDialog,
  } = useInventoryDelete({
    setInventoryItems,
    selection,
  })

  const { editDialog, setEditDialog, handleEdit, handleSaveEdit } =
    useInventoryEdit({
      inventoryItems,
      setInventoryItems,
    })

  // Handlers
  const handleAddProduct = () => router.push('/product/add-product')
  const handleSearch = (query: string) => setSearchQuery(query)

  return {
    tableData: {
      products: filteredProducts,
      currentItems: pagination.currentItems,
      selectedRows: selection.selectedRows,
      selectAllState: selection.selectAllCheckboxState,
    },
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      rowsPerPage: pagination.rowsPerPage,
      startIndex: pagination.startIndex,
      endIndex: pagination.endIndex,
      onPageChange: pagination.setCurrentPage,
      onRowsPerPageChange: pagination.setRowsPerPage,
    },
    filters: {
      state: filters,
      onChange: setFilters,
    },
    dialogs: {
      delete: {
        state: deleteDialog,
        onOpenChange: (open: boolean) => !open && handleCloseDeleteDialog(),
        onConfirm: handleConfirmDelete,
      },
      edit: {
        state: editDialog,
        onOpenChange: (open: boolean) =>
          setEditDialog((prev) => ({ ...prev, open })),
        onSave: handleSaveEdit,
      },
    },
    actions: {
      onSearch: handleSearch,
      onAddProduct: handleAddProduct,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onBulkDelete: handleBulkDelete,
      onSelectRow: selection.handleSelectRow,
      onSelectAll: selection.handlePageSelectAll,
    },
  }
}
