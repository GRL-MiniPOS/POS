'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Label,
} from '@/app/components/atoms'
import {
  OptionGroupsEditor,
  VariantMatrix,
  UploadImages,
  GenericConfirmDialog,
} from '@/app/components/molecules'
import { useProductForm } from '@/app/hooks/product/useProductForm'
import type { Product } from '@/app/lib/schemas/products.schema'

type ProductFormProps =
  | { mode: 'create' }
  | { mode: 'edit'; productId: string; initialProduct: Product }

export function ProductForm(props: ProductFormProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const { fields, specs, categories, actions, status } = useProductForm(props)

  const isEdit = props.mode === 'edit'
  const currentImage = isEdit ? props.initialProduct.image : ''

  const handleValidateAndOpenDialog = () => {
    if (actions.validate()) {
      setIsConfirmDialogOpen(true)
    }
  }

  return (
    <div className="container max-w-4xl p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {isEdit ? '編輯商品' : '新增商品'}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">商品資料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="product-name">商品名稱</Label>
            <Input
              id="product-name"
              type="text"
              placeholder="請輸入商品名稱"
              value={fields.name}
              onChange={(event) => fields.onNameChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-category">商品類別</Label>
            <Select
              value={fields.categoryId}
              onValueChange={fields.onCategoryChange}
              disabled={categories.isPending || categories.items.length === 0}
            >
              <SelectTrigger id="product-category" className="w-full">
                <SelectValue
                  placeholder={
                    categories.isPending
                      ? '載入分類中...'
                      : categories.isError
                        ? '分類載入失敗'
                        : categories.items.length === 0
                          ? '尚無分類'
                          : '請選擇'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.items.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-price">價格</Label>
            <Input
              id="product-price"
              type="number"
              placeholder="請輸入價格"
              value={fields.price}
              min={0}
              onChange={(event) => fields.onPriceChange(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>規格</Label>
            <OptionGroupsEditor
              optionGroups={specs.optionGroups}
              canAddGroup={specs.canAddGroup}
              onAddGroup={specs.onAddGroup}
              onRemoveGroup={specs.onRemoveGroup}
              onRenameGroup={specs.onRenameGroup}
              onAddValue={specs.onAddValue}
              onUpdateValue={specs.onUpdateValue}
              onRemoveValue={specs.onRemoveValue}
            />
            {specs.hasVariants ? (
              <VariantMatrix
                variants={specs.variants}
                onVariantQuantityChange={specs.onVariantQuantityChange}
                onVariantSaleStatusToggle={specs.onVariantSaleStatusToggle}
              />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product-quantity">庫存數量</Label>
                <Input
                  id="product-quantity"
                  type="number"
                  min="0"
                  placeholder="請輸入庫存數量"
                  value={fields.quantity}
                  onChange={(event) =>
                    fields.onQuantityChange(event.target.value)
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>圖片</Label>
            {isEdit && currentImage && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  目前圖片（上傳新圖片將取代）
                </p>
                <Image
                  src={currentImage}
                  alt="目前商品圖片"
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </div>
            )}
            <UploadImages
              className="flex flex-wrap gap-3"
              files={fields.files}
              onFilesChange={fields.onFilesChange}
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="px-8 py-5"
              onClick={handleValidateAndOpenDialog}
              disabled={status.isSubmitting}
            >
              {status.isSubmitting
                ? isEdit
                  ? '儲存中...'
                  : '新增中...'
                : isEdit
                  ? '儲存'
                  : '新增'}
            </Button>
          </div>
        </CardContent>
      </Card>
      <GenericConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={actions.submit}
        title={isEdit ? '確定要儲存變更嗎？' : '確定要新增商品嗎？'}
        description={
          isEdit
            ? '此操作將更新商品資料，請確認所有資訊正確。'
            : '此操作將創建新的商品資料，請確認所有資訊正確。'
        }
        variant="default"
      />
    </div>
  )
}
