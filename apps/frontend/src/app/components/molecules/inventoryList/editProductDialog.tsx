'use client'

import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  Button,
  Input,
  FormField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/atoms'
import { SpecificationInput } from '@/app/components/molecules'
import { useEditProductForm } from '@/app/hooks'
import type { IInventoryItem } from '@/app/types/inventoryList'

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: IInventoryItem
  onSave: (updatedProduct: Partial<IInventoryItem>) => void
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: EditProductDialogProps) {
  const { formData, errors, validateForm, updateField, resetForm } =
    useEditProductForm(product)

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      onOpenChange(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'price') {
      updateField(
        name as keyof IInventoryItem,
        value === '' ? 0 : parseFloat(value) || 0
      )
    } else {
      updateField(name as keyof IInventoryItem, value)
    }
  }

  // 計算目前表單中的總庫存
  const currentTotalStock = formData.specifications
    ? formData.specifications.reduce((total, spec) => total + spec.quantity, 0)
    : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯商品</DialogTitle>
          <DialogDescription className="sr-only">
            編輯商品資訊
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormField
            label="商品名稱"
            required
            error={errors.name}
            htmlFor="name"
          >
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="請輸入商品名稱"
              maxLength={100}
              value={formData.name || ''}
              onChange={handleInputChange}
              className={errors.name ? 'border-destructive' : ''}
            />
          </FormField>
          <FormField
            label="商品分類"
            required
            error={errors.category}
            htmlFor="category"
          >
            <Select
              value={formData.category || ''}
              onValueChange={(value) => updateField('category', value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="請選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="上衣">上衣</SelectItem>
                <SelectItem value="褲子">褲子</SelectItem>
                <SelectItem value="配件">配件</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            label="價格 (NT$)"
            required
            error={errors.price}
            htmlFor="price"
          >
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="1"
              placeholder="590"
              className="w-32"
              value={formData.price === 0 ? '' : formData.price}
              onChange={handleInputChange}
            />
          </FormField>
          <SpecificationInput
            specifications={formData.specifications || []}
            onChange={(specs) => updateField('specifications', specs)}
            error={errors.specifications}
          />
          {/* 警告：所有規格庫存為 0 */}
          {currentTotalStock === 0 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">
                警告：所有規格庫存均為 0，該商品將顯示為缺貨
              </span>
            </div>
          )}
          {/* 顯示總庫存（只讀，由規格數量加總計算） */}
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
            <span className="text-sm text-muted-foreground">總庫存：</span>
            <span className="font-semibold">{currentTotalStock} 件</span>
            <span className="text-xs text-muted-foreground ml-2">
              （由各規格數量自動計算）
            </span>
          </div>
          <FormField label="商品圖片 URL" htmlFor="image">
            <Input
              id="image"
              name="image"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={formData.image || ''}
              onChange={handleInputChange}
            />
          </FormField>
        </div>

        <div className="flex justify-start gap-2 pt-4">
          <Button type="button" onClick={handleSave}>
            儲存變更
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
