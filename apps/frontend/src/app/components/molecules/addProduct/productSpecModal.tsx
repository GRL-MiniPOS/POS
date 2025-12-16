'use client'

import { Plus } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/atoms'
import { IProductSpec } from '@/app/types/addProduct'
import { useProductSpecForm } from '@/app/hooks/useProductSpecForm'
import { ProductSpecItem } from './productSpecItem'

interface ProductSpecModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productSpecs: IProductSpec[]
  setProductSpec: (specs: IProductSpec[]) => void
}

export function ProductSpecModal({
  open,
  onOpenChange,
  productSpecs,
  setProductSpec,
}: ProductSpecModalProps) {
  const {
    localProductSpecs,
    addNewLocalProductSpec,
    removeLocalProductSpec,
    updateLocalProductSpec,
    resetLocalProductSpecs,
    handleSave,
    handleCancel,
  } = useProductSpecForm({
    productSpecs,
    setProductSpec,
    onOpenChange,
  })

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetLocalProductSpecs()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            新增產品規格
          </DialogTitle>
          <DialogDescription>
            新增產品的不同規格選項，如顏色、尺寸等
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewLocalProductSpec}
                className="flex items-center gap-1 h-8 px-3 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                新增規格
              </Button>
            </div>
            <div className="space-y-3">
              {localProductSpecs.map((localProductSpec) => (
                <ProductSpecItem
                  key={localProductSpec.id}
                  localProductSpec={localProductSpec}
                  onUpdate={updateLocalProductSpec}
                  onRemove={removeLocalProductSpec}
                  showRemoveButton={localProductSpecs.length > 1}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            儲存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
