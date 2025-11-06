'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Button,
  Input,
  Label,
  toast,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/atoms'
import { IProductSpec } from '@/app/types/addProduct'
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
  const [localSpecs, setSpecs] = useState<IProductSpec[]>([
    { id: Date.now().toString(), name: '', quantity: '' },
  ])
  const addNewSpec = () => {
    const newSpec: IProductSpec = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
    }
    setSpecs((prev) => [...prev, newSpec])
  }
  const removeSpec = (id: string) => {
    if (localSpecs.length > 1) {
      setSpecs((prev) => prev.filter((localSpec) => localSpec.id !== id))
    }
  }
  const updateSpec = (
    id: string,
    field: keyof Omit<IProductSpec, 'id'>,
    value: string
  ) => {
    setSpecs((prev) =>
      prev.map((localSpec) =>
        localSpec.id === id ? { ...localSpec, [field]: value } : localSpec
      )
    )
  }
  // 關閉dialog(save、cancel、點擊close等等關閉操作)都會重置規格欄位
  const resetSpecs = () => {
    setSpecs([{ id: Date.now().toString(), name: '', quantity: '' }])
  }
  const handleSave = () => {
    const isFieldEmpty = localSpecs.some(
      (localSpec) =>
        localSpec.name.trim() === '' || localSpec.quantity.trim() === ''
    )
    if (isFieldEmpty) {
      toast('輸入欄位不得為空')
      return
    }

    const existingSpec = new Set(productSpecs.map((spec) => spec.name))
    const isDuplicate = localSpecs.some((localSpec) => {
      return existingSpec.has(localSpec.name)
    })
    if (isDuplicate) {
      toast('規格不得重複')
      return
    }

    setProductSpec([...productSpecs, ...localSpecs])
    resetSpecs()
    onOpenChange(false)
  }
  const handleCancel = () => {
    resetSpecs()
    onOpenChange(false)
  }
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetSpecs()
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
                onClick={addNewSpec}
                className="flex items-center gap-1 h-8 px-3 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                新增規格
              </Button>
            </div>
            <div className="space-y-3">
              {localSpecs.map((localSpec) => (
                <div
                  key={localSpec.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label
                          htmlFor={`localSpec-name-${localSpec.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          名稱
                        </Label>
                        <Input
                          id={`localSpec-name-${localSpec.id}`}
                          placeholder="例：顏色、尺寸"
                          value={localSpec.name}
                          onChange={(e) =>
                            updateSpec(localSpec.id, 'name', e.target.value)
                          }
                          className="h-9"
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`localSpec-quantity-${localSpec.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          數量
                        </Label>
                        <Input
                          id={`localSpec-quantity-${localSpec.id}`}
                          placeholder="例：100"
                          value={localSpec.quantity}
                          onChange={(e) =>
                            updateSpec(localSpec.id, 'quantity', e.target.value)
                          }
                          className="h-9"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  {localSpecs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpec(localSpec.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
