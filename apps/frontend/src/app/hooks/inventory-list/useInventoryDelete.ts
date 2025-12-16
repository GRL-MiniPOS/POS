import { useState } from 'react'
import { toast } from 'sonner'
import { IInventoryItem, IDeleteDialogState } from '@/app/types/inventoryList'

interface UseInventoryDeleteProps {
  setInventoryItems: React.Dispatch<React.SetStateAction<IInventoryItem[]>>
  selection: {
    selectedRows: Set<string>
    clearSelection: () => void
  }
}

export function useInventoryDelete({
  setInventoryItems,
  selection,
}: UseInventoryDeleteProps) {
  const [deleteDialog, setDeleteDialog] = useState<IDeleteDialogState>({
    open: false,
    type: null,
  })

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

  return {
    deleteDialog,
    handleDelete,
    handleBulkDelete,
    handleConfirmDelete,
    handleCloseDeleteDialog,
  }
}
