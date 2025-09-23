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
} from '@/app/components/atoms'
import { AddProductSpec, UploadImages } from '@/app/components/molecules'
import { ConfirmDialog } from '@/app/components/molecules/addProduct/confirmDialog'

export default function AddProduct() {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const productCategory = [
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
  ]

  const handleAddProduct = () => {
    console.log('新增商品')
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
            <Input type="text" placeholder="請輸入商品名稱" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              商品類別
            </p>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="請選擇" />
              </SelectTrigger>
              <SelectContent>
                {productCategory.map((item) => (
                  <SelectItem key={item.id} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              規格
            </p>
            <AddProductSpec className="flex flex-wrap gap-3" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              圖片
            </p>
            <UploadImages className="flex flex-wrap gap-3" />
          </div>
          <div className="flex justify-end">
            <Button
              className="px-8 py-5"
              onClick={() => setIsConfirmDialogOpen(true)}
            >
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
