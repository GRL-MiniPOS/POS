'use client'

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

    if (name === 'price' || name === 'stock') {
      updateField(
        name as keyof IInventoryItem,
        value === '' ? 0 : parseFloat(value) || 0
      )
    } else {
      updateField(name as keyof IInventoryItem, value)
    }
  }

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
          <SpecificationInput
            specifications={formData.specifications || []}
            onChange={(specs) => updateField('specifications', specs)}
            error={errors.specifications}
          />
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
          <FormField
            label="庫存數量"
            required
            error={errors.stock}
            htmlFor="stock"
          >
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              placeholder="請輸入庫存數量"
              className="w-32"
              value={formData.stock === 0 ? '' : formData.stock}
              onChange={handleInputChange}
            />
          </FormField>
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
