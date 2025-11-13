'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  InventoryTableHeader,
  InventoryPagination,
  InventoryTableContent,
  GenericConfirmDialog,
} from '@/app/components/molecules'
import {
  useInventorySearch,
  useInventoryPagination,
  useInventorySelection,
} from '@/app/hooks'
import type { IProduct, IInventoryItem } from '@/app/types/inventoryList'
import { mockProducts as mockInventoryItems } from './mock/data'

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

export default function InventoryList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  // 使用 mock 資料並轉換格式（使用 useState 以支援刪除操作）
  const [allProducts, setAllProducts] = useState<IProduct[]>(() =>
    mockInventoryItems.map(convertToProduct)
  )
  const filteredProducts = useInventorySearch(allProducts, searchQuery)
  const {
    currentPage,
    rowsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems: currentProducts,
    setCurrentPage,
    setRowsPerPage,
  } = useInventoryPagination(filteredProducts, 5)
  const {
    selectedRows,
    selectAllCheckboxState,
    handleSelectRow,
    handlePageSelectAll,
    clearSelection,
  } = useInventorySelection(currentProducts, filteredProducts, searchQuery)

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: 'single' | 'bulk' | null
    productId?: string
    selectedCount?: number
  }>({
    open: false,
    type: null,
  })

  const handleCloseDialog = () => {
    setDeleteDialog({
      open: false,
      type: null,
    })
  }

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'single' && deleteDialog.productId) {
      setAllProducts((prev) =>
        prev.filter((product) => product.id !== deleteDialog.productId)
      )
      toast.success('已成功刪除商品')
    } else if (deleteDialog.type === 'bulk') {
      setAllProducts((prev) =>
        prev.filter((product) => !selectedRows.has(product.id))
      )
      clearSelection()
      toast.success(`已成功刪除 ${deleteDialog.selectedCount} 個商品`)
    }
    handleCloseDialog()
  }

  // 批量刪除（Gmail 風格：頁碼自動調整由 useInventoryPagination hook 處理）
  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedRows)

    // 驗證輸入
    if (selectedIds.length === 0) {
      toast.error('請先選擇要刪除的商品')
      return
    }

    // 顯示確認刪除對話框（批量刪除）
    setDeleteDialog({
      open: true,
      type: 'bulk',
      selectedCount: selectedIds.length,
    })
  }

  // 副作用：搜尋改變時重置分頁
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, setCurrentPage])

  const handleEdit = (id: string) => {
    console.log('Edit product:', id)
  }

  // 單個刪除（Gmail 風格：頁碼自動調整由 useInventoryPagination hook 處理）
  const handleDelete = (id: string) => {
    setDeleteDialog({
      open: true,
      type: 'single',
      productId: id,
    })
  }

  const handleAddProduct = () => {
    router.push('/product/add-product')
  }

  const handleSearchInventory = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="container max-w-7xl p-6">
      <InventoryTableHeader
        className="mb-6"
        onAddProduct={handleAddProduct}
        onSearch={handleSearchInventory}
      />
      <div className="overflow-x-auto pb-4 border border-border rounded-lg">
        <InventoryTableContent
          products={currentProducts}
          selectedRows={selectedRows}
          selectAll={selectAllCheckboxState}
          onSelectRow={handleSelectRow}
          onSelectAll={handlePageSelectAll}
          onBulkDelete={handleBulkDelete}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <InventoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          totalItems={filteredProducts.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>
      <GenericConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog()
        }}
        onConfirm={handleConfirmDelete}
        title={deleteDialog.type === 'bulk' ? '批量刪除商品' : '刪除商品'}
        description={
          deleteDialog.type === 'bulk'
            ? `確定要刪除所選的 ${deleteDialog.selectedCount} 個商品嗎？此操作無法復原。`
            : '你確定要刪除該商品嗎？此操作無法復原。'
        }
        variant="destructive"
        buttonText={{ confirm: '刪除', cancel: '取消' }}
      />
    </div>
  )
}
