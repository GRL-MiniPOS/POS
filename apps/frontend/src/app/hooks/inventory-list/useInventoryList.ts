import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  useInventorySearch,
  useInventoryPagination,
  useInventorySelection,
  useInventoryFilter,
} from '@/app/hooks'
import type {
  IProduct,
  IInventoryItem,
  IFilterState,
  IDeleteDialogState,
  IEditDialogState,
} from '@/app/types/inventoryList'
import { mockProducts as mockInventoryItems } from '@/app/product/inventory-list/mock/data'

// 將 IInventoryItem 轉換為 IProduct 格式以供表格使用
const convertToProduct = (item: IInventoryItem): IProduct => ({
  id: item.id,
  name: item.name,
  category: item.category,
  specification: item.specifications.join(', '),
  price: `NT$ ${item.price.toLocaleString()}`,
  inventory: item.stock === 0 ? '缺貨' : `${item.stock} 件`,
  image: item.image,
})

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

  // Dialog States
  const [deleteDialog, setDeleteDialog] = useState<IDeleteDialogState>({
    open: false,
    type: null,
  })

  const [editDialog, setEditDialog] = useState<IEditDialogState>({
    open: false,
    product: null,
  })

  // 資料處理流程：filter → convert → search → paginate → select
  const filteredByCondition = useInventoryFilter(inventoryItems, filters)
  const allProducts = filteredByCondition.map(convertToProduct)
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

  // Handlers
  const handleAddProduct = () => router.push('/product/add-product')
  const handleSearch = (query: string) => setSearchQuery(query)

  // Delete Dialog Logic
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, type: null })
  }

  const handleDelete = (id: string) => {
    setDeleteDialog({
      open: true,
      type: 'single',
      productId: id,
    })
  }

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selection.selectedRows)
    if (selectedIds.length === 0) {
      toast.error('請先選擇要刪除的商品')
      return
    }
    setDeleteDialog({
      open: true,
      type: 'bulk',
      selectedCount: selectedIds.length,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'single' && deleteDialog.productId) {
      setInventoryItems((prev) =>
        prev.filter((item) => item.id !== deleteDialog.productId)
      )
      toast.success('已成功刪除商品')
    } else if (deleteDialog.type === 'bulk') {
      setInventoryItems((prev) =>
        prev.filter((item) => !selection.selectedRows.has(item.id))
      )
      selection.clearSelection()
      toast.success(`已成功刪除 ${deleteDialog.selectedCount} 個商品`)
    }
    handleCloseDeleteDialog()
  }

  // Edit Dialog Logic
  const handleEdit = (id: string) => {
    const item = inventoryItems.find((item) => item.id === id)
    if (item) {
      setEditDialog({ open: true, product: item })
    }
  }

  const handleSaveEdit = (updatedProduct: Partial<IInventoryItem>) => {
    setInventoryItems((prev) =>
      prev.map((item) =>
        item.id === updatedProduct.id
          ? { ...item, ...updatedProduct, updatedAt: new Date() }
          : item
      )
    )
    toast.success('已成功更新商品資訊')
  }

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
