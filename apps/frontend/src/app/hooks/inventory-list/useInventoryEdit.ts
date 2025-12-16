import { useState } from 'react'
import { toast } from 'sonner'
import { IInventoryItem, IEditDialogState } from '@/app/types/inventoryList'

interface UseInventoryEditProps {
  inventoryItems: IInventoryItem[]
  setInventoryItems: React.Dispatch<React.SetStateAction<IInventoryItem[]>>
}

export function useInventoryEdit({
  inventoryItems,
  setInventoryItems,
}: UseInventoryEditProps) {
  const [editDialog, setEditDialog] = useState<IEditDialogState>({
    open: false,
    product: null,
  })

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
    editDialog,
    setEditDialog,
    handleEdit,
    handleSaveEdit,
  }
}
