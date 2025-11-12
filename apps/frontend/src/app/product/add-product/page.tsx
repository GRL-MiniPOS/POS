'use client'
import { useState } from 'react'
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
  toast,
} from '@/app/components/atoms'
import {
  AddProductSpec,
  UploadImages,
  ConfirmDialog,
} from '@/app/components/molecules'
import { IProductFormData } from '@/app/types/addProduct'

// 商品表單初始化資料
const Initial_FORM_STATE: IProductFormData = {
  productName: '',
  selectedCategory: '',
  price: 0,
  productSpecs: [],
  uploadFiles: [],
}

export default function AddProduct() {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  // 商品表單資料
  const [productFormData, setProductFormData] =
    useState<IProductFormData>(Initial_FORM_STATE)

  // 商品類別選項
  const [categoryOptions] = useState([
    {
      id: 1,
      name: '商品類別1',
    },
    {
      id: 2,
      name: '商品類別2',
    },
    {
      id: 3,
      name: '商品類別3',
    },
  ])

  const updateFormData = <k extends keyof IProductFormData>(
    key: k,
    value: IProductFormData[k]
  ) => {
    setProductFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetFormData = () => {
    setProductFormData(Initial_FORM_STATE)
  }

  const handleValidateAndOpenDialog = () => {
    if (
      productFormData.productName.trim() === '' ||
      productFormData.selectedCategory.trim() === ''
    ) {
      toast('商品名稱和商品類別不得為空')
      return
    }

    if (productFormData.price === 0) {
      toast('價格不得設置為0')
      return
    }

    setIsConfirmDialogOpen(true)
  }

  const handleAddProduct = () => {
    console.log('新增商品')
    resetFormData()
  }

  return (
    <div className="container max-w-4xl p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">新增商品</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">商品資料</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              商品名稱
            </p>
            <Input
              type="text"
              placeholder="請輸入商品名稱"
              value={productFormData.productName}
              onChange={(e) => updateFormData('productName', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              商品類別
            </p>
            <Select
              value={productFormData.selectedCategory}
              onValueChange={(value) =>
                updateFormData('selectedCategory', value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              價格
            </p>
            <Input
              type="number"
              placeholder="請輸入價格"
              value={productFormData.price || ''}
              min={0}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value)
                updateFormData('price', value)
              }}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              規格
            </p>
            <AddProductSpec
              className="flex flex-wrap gap-3"
              specs={productFormData.productSpecs}
              onSpecsChange={(specs) => updateFormData('productSpecs', specs)}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              圖片
            </p>
            <UploadImages
              className="flex flex-wrap gap-3"
              files={productFormData.uploadFiles}
              onFilesChange={(files) => updateFormData('uploadFiles', files)}
            />
          </div>
          <div className="flex justify-end">
            <Button className="px-8 py-5" onClick={handleValidateAndOpenDialog}>
              新增
            </Button>
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        handleAddProduct={handleAddProduct}
      />
    </div>
  )
}
